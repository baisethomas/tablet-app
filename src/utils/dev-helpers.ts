import { SavedSermon } from '../types/sermon';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Creates sample sermon data for development and testing
 */
export async function createSampleSermonData(): Promise<void> {
  // Only run in development
  if (!__DEV__) return;
  
  console.log("Creating sample sermon data...");

  // Create sample sermons
  const sampleSermons: SavedSermon[] = [
    {
      id: 'sermon-123',
      date: new Date().toISOString(),
      title: 'Love Your Neighbor',
      transcript: `
In today's message, we're going to explore what it truly means to love your neighbor as yourself. This teaching, found in both the Old and New Testaments, is central to our faith.

Jesus was once asked what the greatest commandment was. He replied that we should love God with all our heart, soul, mind, and strength. And the second is to love your neighbor as yourself.

But what does this look like in practice? It means seeing others with compassion and empathy. It means stepping out of our comfort zones to help those in need. It means setting aside prejudices and biases.

Remember the parable of the Good Samaritan? A man was robbed and left for dead on the roadside. Religious leaders passed by, but a Samaritan - someone from a despised cultural group - stopped to help.

This challenges us to expand our definition of "neighbor" beyond those who are like us or live near us. Everyone we encounter is our neighbor.

As we go through this week, I challenge you to look for opportunities to love your neighbors in practical ways. Maybe it's through acts of kindness, words of encouragement, or simply being present with someone who's hurting.
      `,
      notes: 'The sermon emphasized loving all people regardless of differences. I need to be more intentional about showing kindness to people I normally avoid.'
    },
    {
      id: 'sermon-456',
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      title: 'Faith and Works',
      transcript: `
James chapter 2 presents us with a challenging message about the relationship between faith and works. James writes, "Faith without works is dead."

Some have misunderstood this to mean that we are saved by our works, but that's not what James is saying. He's addressing the nature of true faith.

True faith is not merely intellectual assent to certain facts. True faith transforms us and naturally produces good works. These works don't save us, but they are evidence of our salvation.

It's like a fruit tree. A healthy apple tree will naturally produce apples. The apples don't make it an apple tree - it already is one. But if a tree claims to be an apple tree yet never produces any apples, we would question whether it truly is what it claims to be.

In the same way, a person who claims to have faith but whose life shows no evidence of that faith should examine themselves to see if their faith is genuine.

Let's be people whose faith is evident through our love, compassion, and good deeds toward others. Not to earn God's favor, but because we already have it through Christ.
      `,
      notes: ''
    }
  ];

  // Save to AsyncStorage
  await AsyncStorage.setItem('savedSermons', JSON.stringify(sampleSermons));
  
  console.log("Sample sermon data created successfully!");
}

/**
 * Clears all sermon data from AsyncStorage
 */
export async function clearSermonData(): Promise<void> {
  await AsyncStorage.removeItem('savedSermons');
  console.log("Sermon data cleared.");
} 