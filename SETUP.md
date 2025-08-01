# Google AI Integration Setup

## 🚀 Your React app now has Google AI integration!

The app has been successfully updated to use Google's Generative AI (Gemini) for content generation instead of mock data.

## 🔑 API Key Setup

To use the AI features, you need to set up a Google AI API key:

### Step 1: Get your API Key
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### Step 2: Create Environment File
1. Create a `.env` file in your project root
2. Add your API key:
```
VITE_GOOGLE_AI_API_KEY=your_actual_api_key_here
```

### Step 3: Start the Development Server
```bash
npm run dev
```

## ✨ What's New

- **Real AI Generation**: Uses Google's Gemini 1.5 Flash model
- **Dual Modes**: Text-to-post AND image-to-caption generation
- **Image Analysis**: Upload any image and get AI-generated captions
- **Smart Prompting**: Creates comprehensive prompts based on your inputs
- **Visual Recognition**: AI analyzes uploaded images for accurate descriptions
- **Error Handling**: Falls back to mock content if AI fails
- **JSON Parsing**: Safely parses AI responses
- **Character Limits**: AI respects platform-specific character limits

## 🛡️ Security Notes

- Your `.env` file is already in `.gitignore` 
- Never commit your API key to version control
- The API key is prefixed with `VITE_` to work with Vite

## 🔧 Troubleshooting

If you see "AI generation failed" alerts:
1. Check your API key is correct
2. Ensure you have internet connection
3. Verify your Google AI account has credits
4. The app will still work with fallback content

## 📱 Features

### 🔤 Text-to-Post Mode
Generate content from topics and themes:
- **Visual Descriptions**: Detailed descriptions for your content type
- **Captions**: Platform-optimized, tone-appropriate captions
- **Hashtags**: Relevant hashtags for each platform
- **Call-to-Actions**: Platform-specific engagement prompts

### 🖼️ Image-to-Caption Mode
Upload any image and get instant captions:
- **Image Analysis**: AI describes what it sees in your image
- **Context-Aware Captions**: Captions that match the image content
- **Mood Detection**: Recognizes colors, objects, scenes, and atmosphere
- **Brand Integration**: Incorporates your brand voice into image descriptions
- **File Support**: Works with PNG, JPG, GIF images up to 10MB

### 🎯 Smart Features
- **Dual Mode Toggle**: Easily switch between text and image generation
- **Image Preview**: See your uploaded image before generating
- **One-Click Remove**: Easy image removal and re-upload
- **Platform Optimization**: All content respects character limits
- **Tone Consistency**: Maintains your selected tone across both modes

All content is optimized for each social media platform and respects character limits!