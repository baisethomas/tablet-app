# Environment Setup

## Configuration
The app uses environment variables for sensitive configuration. These are managed through `.env` files and expo-constants.

### Required Environment Variables
- `ASSEMBLYAI_API_KEY`: Your AssemblyAI API key
- `APP_ENV`: Application environment (development, staging, production)

### Setup Instructions
1. Copy `.env.example` to `.env`
2. Fill in your actual API keys and configuration
3. Never commit `.env` file to version control

### Accessing Environment Variables
Environment variables are accessed through expo-constants:

```typescript
import Constants from 'expo-constants';
const apiKey = Constants.expoConfig?.extra?.ASSEMBLYAI_API_KEY;
```

### Security Notes
- Keep your `.env` file secure and never commit it to version control
- Use different API keys for development and production
- Regularly rotate API keys for security
- Store API keys in a secure password manager
- Use environment-specific API keys for different deployment environments

### Troubleshooting
If you encounter issues with environment variables:
1. Verify the `.env` file exists in the root directory
2. Check that the variable names match in `.env` and `app.config.js`
3. Restart the Expo development server after making changes
4. Ensure the API key is properly formatted and valid

### Development Workflow
1. Development:
   ```bash
   # Use development API key
   ASSEMBLYAI_API_KEY=dev_key_here
   APP_ENV=development
   ```

2. Production:
   ```bash
   # Use production API key
   ASSEMBLYAI_API_KEY=prod_key_here
   APP_ENV=production
   ```

### Best Practices
1. Always use `.env.example` as a template
2. Keep API keys out of version control
3. Use different keys for different environments
4. Document any changes to environment variables
5. Regularly review and update API keys

## Overview
This document outlines the environment configuration for the Tablet Sermon Note-Taking App, including API keys, environment variables, and configuration settings.

## Environment Variables

### Required Variables
- `ASSEMBLYAI_API_KEY`: Your AssemblyAI API key for transcription services
- `APP_ENV`: Application environment (development, staging, production)
- `DEBUG`: Enable/disable debug mode

### Optional Variables (Future Use)
- Firebase configuration variables
- Other third-party service API keys

## Setup Instructions

### 1. Create .env File
Create a `.env` file in the root directory of the project with the following structure:
```env
ASSEMBLYAI_API_KEY=your_api_key_here
APP_ENV=development
DEBUG=true
```

### 2. Install Required Packages
```bash
npx expo install expo-constants
```

### 3. Configure expo-constants
Add the following to your `app.config.js` or `app.json`:
```javascript
{
  "expo": {
    "extra": {
      "ASSEMBLYAI_API_KEY": process.env.ASSEMBLYAI_API_KEY,
      "APP_ENV": process.env.APP_ENV,
      "DEBUG": process.env.DEBUG
    }
  }
}
```

### 4. Access Environment Variables
In your code, access environment variables using:
```typescript
import Constants from 'expo-constants';

const apiKey = Constants.expoConfig?.extra?.ASSEMBLYAI_API_KEY;
```

## Security Best Practices

1. **Never commit .env files**
   - Add `.env` to your `.gitignore` file
   - Create a `.env.example` file as a template

2. **API Key Management**
   - Rotate API keys regularly
   - Use different keys for development and production
   - Restrict API key permissions to minimum required access

3. **Environment-specific Configuration**
   - Use different API keys for different environments
   - Configure appropriate debug levels per environment
   - Set up proper error reporting per environment

## Troubleshooting

### Common Issues
1. **Environment Variables Not Loading**
   - Ensure `.env` file is in the correct location
   - Check for typos in variable names
   - Verify expo-constants configuration

2. **API Key Not Working**
   - Verify API key is correct
   - Check API key permissions
   - Ensure proper environment is set

### Debugging
- Set `DEBUG=true` in development
- Use console.log for environment variables (only in development)
- Check Expo logs for configuration issues

## Production Deployment

### Environment Setup
1. Create production-specific `.env` file
2. Use production API keys
3. Set `APP_ENV=production`
4. Set `DEBUG=false`

### Security Checklist
- [ ] API keys are properly secured
- [ ] Debug mode is disabled
- [ ] Environment variables are properly set
- [ ] Error reporting is configured
- [ ] API rate limits are considered

## Support
For issues with environment setup or configuration, contact the development team or refer to the project's technical documentation. 