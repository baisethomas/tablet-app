import * as TaskManager from 'expo-task-manager';
import * as FileSystem from 'expo-file-system'; // Needed for cleanup
import { updateSermon } from '../services/sermon-storage';
import { uploadAudioFile, submitBatchJob, pollBatchJobStatus } from '../services/assemblyai';
import { generateSermonSummary } from '../services/openai';
import { SavedSermon } from '../types/sermon'; // Ensure this path is correct

export const SERMON_PROCESSING_TASK = 'SERMON_PROCESSING_TASK';

TaskManager.defineTask(SERMON_PROCESSING_TASK, async ({ data, error }) => {
  if (error) {
    console.error(`[${SERMON_PROCESSING_TASK}] Error executing task:`, error);
    // Potentially update sermon status to error here if we have the ID? Risky without data.
    return;
  }

  const { sermonId, audioUri } = data as { sermonId: string, audioUri: string };

  if (!sermonId || !audioUri) {
    console.error(`[${SERMON_PROCESSING_TASK}] Missing sermonId or audioUri in task data.`);
    return; // Cannot proceed without required data
  }

  console.log(`[${SERMON_PROCESSING_TASK}] Starting processing for sermon: ${sermonId}, URI: ${audioUri}`);

  let finalStatus: SavedSermon['processingStatus'] = 'error';
  let finalError: string | undefined = 'Unknown processing error occurred.';
  let summaryResult: SavedSermon['summary'] = undefined;
  let transcriptResult: string = '';

  try {
    // 1. Mark as processing (already done before scheduling, but good to confirm/re-set)
    // We might not need to do this again if stopRecordingAndProcess sets it reliably.
    // await updateSermon(sermonId, { processingStatus: 'processing' });

    // 2. Upload Audio
    console.log(`[${SERMON_PROCESSING_TASK}] Uploading audio...`);
    const uploadUrl = await uploadAudioFile(audioUri);
    if (!uploadUrl) throw new Error("Audio upload failed, no URL returned.");
    console.log(`[${SERMON_PROCESSING_TASK}] Upload successful: ${uploadUrl}`);

    // 3. Submit Transcription Job
    console.log(`[${SERMON_PROCESSING_TASK}] Submitting transcription job...`);
    const jobId = await submitBatchJob(uploadUrl);
    if (!jobId) throw new Error("Transcription job submission failed, no ID returned.");
    console.log(`[${SERMON_PROCESSING_TASK}] Job submitted: ${jobId}`);

    // 4. Poll for Transcription Result
    console.log(`[${SERMON_PROCESSING_TASK}] Polling for transcription results...`);
    const transcriptData = await pollBatchJobStatus(jobId);
    if (transcriptData.status !== 'completed' || !transcriptData.text) {
      throw new Error(transcriptData.error || 'Transcription polling failed or returned no text.');
    }
    transcriptResult = transcriptData.text;
    console.log(`[${SERMON_PROCESSING_TASK}] Transcription complete.`);

    // 5. Generate Summary (Optional - could fail gracefully)
    try {
        console.log(`[${SERMON_PROCESSING_TASK}] Generating summary...`);
        summaryResult = await generateSermonSummary(transcriptResult);
        console.log(`[${SERMON_PROCESSING_TASK}] Summary generated.`);
    } catch (summaryError: any) {
        console.warn(`[${SERMON_PROCESSING_TASK}] Failed to generate summary (continuing without it):`, summaryError.message);
        // Don't throw; allow process to complete with transcript only
    }

    // If we reach here, processing was successful
    finalStatus = 'completed';
    finalError = undefined; // Clear error message on success
    console.log(`[${SERMON_PROCESSING_TASK}] Processing successful for sermon ${sermonId}.`);

  } catch (err: any) {
    console.error(`[${SERMON_PROCESSING_TASK}] Error during processing sermon ${sermonId}:`, err);
    finalError = err.message || 'An unknown error occurred during background processing.';
    finalStatus = 'error';

  } finally {
    // 6. Update Sermon Record in AsyncStorage with final status, results, and error message
    try {
      console.log(`[${SERMON_PROCESSING_TASK}] Updating final sermon record for ${sermonId} with status: ${finalStatus}`);
      await updateSermon(sermonId, {
        processingStatus: finalStatus,
        transcript: finalStatus === 'completed' ? transcriptResult : '', // Only save transcript on success
        summary: finalStatus === 'completed' ? summaryResult : undefined, // Only save summary on success
        processingError: finalError,
        // Optionally keep audioUrl or clear it after processing?
        // audioUrl: audioUri // Keep local URI for potential playback later?
      });
      console.log(`[${SERMON_PROCESSING_TASK}] Final update successful for ${sermonId}.`);
    } catch (updateErr: any) {
      console.error(`[${SERMON_PROCESSING_TASK}] CRITICAL: Failed to update final sermon status for ${sermonId}:`, updateErr);
      // This is bad, the record in storage might be stuck in 'processing'
    }

    // 7. Clean up the temporary audio file
    try {
        console.log(`[${SERMON_PROCESSING_TASK}] Deleting temporary audio file: ${audioUri}`);
        await FileSystem.deleteAsync(audioUri, { idempotent: true });
        console.log(`[${SERMON_PROCESSING_TASK}] Temporary audio file deleted.`);
    } catch (deleteError: any) {
        console.error(`[${SERMON_PROCESSING_TASK}] Failed to delete temporary audio file ${audioUri}:`, deleteError);
        // Log this, but don't prevent task completion
    }

    // TODO: Add notifications here based on finalStatus
    console.log(`[${SERMON_PROCESSING_TASK}] Task finished for sermon ${sermonId}. Status: ${finalStatus}`);
  }
});

// You might need to register this task somewhere in your app's entry point
// or a relevant initialization file, though sometimes just defining it is enough
// depending on the Expo version and setup.
// console.log(`Task ${SERMON_PROCESSING_TASK} defined.`); 