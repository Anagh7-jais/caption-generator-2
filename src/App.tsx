import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Music, 
  Copy, 
  RefreshCw, 
  Sparkles, 
  Hash, 
  Type,
  Target,
  Heart,
  MessageCircle,
  Share,
  Eye,
  CheckCircle,
  Sun,
  Moon,
  Users,
  Building,
  Camera,
  Video,
  Image as ImageIcon,
  Palette,
  ArrowRight,
  Upload,
  X
} from 'lucide-react';

interface GeneratedContent {
  visualDescription: string;
  caption: string;
  hashtags: string[];
  callToAction: string;
  characterCount: number;
}

interface ContentInputs {
  topic: string;
  brand: string;
  brandDescription: string;
  targetAudience: string;
  tone: string;
  platform: string;
}

const platforms = [
  { name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500', limit: 2200 },
  { name: 'Twitter', icon: Twitter, color: 'bg-blue-500', limit: 280 },
  { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', limit: 3000 },
  { name: 'Facebook', icon: Facebook, color: 'bg-blue-600', limit: 63206 },
  { name: 'TikTok', icon: Music, color: 'bg-gradient-to-r from-red-500 to-black', limit: 150 }
];

const tones = [
  { name: 'Professional', emoji: '💼', description: 'Formal and business-oriented' },
  { name: 'Casual', emoji: '😊', description: 'Friendly and relaxed' },
  { name: 'Inspirational', emoji: '✨', description: 'Motivating and uplifting' },
  { name: 'Humorous', emoji: '😄', description: 'Funny and entertaining' },
  { name: 'Educational', emoji: '📚', description: 'Informative and learning-focused' },
  { name: 'Promotional', emoji: '🚀', description: 'Sales and marketing oriented' }
];

const visualTypes = [
  { name: 'Photo', icon: Camera, description: 'Single image post' },
  { name: 'Carousel', icon: ImageIcon, description: 'Multiple images/slides' },
  { name: 'Video', icon: Video, description: 'Video content' },
  { name: 'Graphic', icon: Palette, description: 'Designed visual content' }
];

const audienceTypes = [
  'Young professionals (25-35)',
  'Small business owners',
  'Students and graduates',
  'Tech enthusiasts',
  'Creative professionals',
  'Entrepreneurs',
  'Marketing professionals',
  'General consumers'
];

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [selectedTone, setSelectedTone] = useState(tones[0]);
  const [selectedVisualType, setSelectedVisualType] = useState(visualTypes[0]);
  const [inputs, setInputs] = useState<ContentInputs>({
    topic: '',
    brand: '',
    brandDescription: '',
    targetAudience: '',
    tone: tones[0].name,
    platform: platforms[0].name
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

    const generateContent = async () => {
    // Check requirements based on mode
    if (mode === 'text' && (!inputs.topic.trim() || !inputs.brand.trim())) return;
    if (mode === 'image' && (!uploadedImage || !inputs.brand.trim())) return;
    
    setIsGenerating(true);
    
    try {
      // Initialize Google AI - You'll need to set your API key
      const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || 'YOUR_API_KEY_HERE';
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      let result;
      
      if (mode === 'image' && uploadedImage) {
        // Convert image to base64
        const imageData = await fileToGenerativePart(uploadedImage);
        
        // Create prompt for image analysis
        const imagePrompt = `
You are a professional social media content creator analyzing an uploaded image. Generate content for the following requirements:

Platform: ${selectedPlatform.name} (character limit: ${selectedPlatform.limit})
Brand: ${inputs.brand}
Brand Description: ${inputs.brandDescription}
Target Audience: ${inputs.targetAudience}
Tone: ${selectedTone.name}

Analyze the uploaded image and generate a JSON response with the following structure:
{
  "visualDescription": "A detailed description of what you see in the image and how it could be used for ${selectedPlatform.name}",
  "caption": "An engaging caption in ${selectedTone.name} tone that describes the image and fits ${selectedPlatform.name}'s style and character limit",
  "hashtags": ["array", "of", "relevant", "hashtags", "based", "on", "image", "content"],
  "callToAction": "A platform-specific call to action that encourages engagement with this image"
}

Focus on what you see in the image - objects, people, scenes, colors, mood, etc. Make the caption engaging and relevant to the image content. Ensure the total character count stays well within the ${selectedPlatform.limit} limit.

Return only the JSON object, no additional text.
        `;

        result = await model.generateContent([imagePrompt, imageData]);
      } else {
        // Text-based content generation (original functionality)
        const textPrompt = `
You are a professional social media content creator. Generate content for the following requirements:

Platform: ${selectedPlatform.name} (character limit: ${selectedPlatform.limit})
Brand: ${inputs.brand}
Brand Description: ${inputs.brandDescription}
Topic: ${inputs.topic}
Target Audience: ${inputs.targetAudience}
Tone: ${selectedTone.name}
Visual Type: ${selectedVisualType.name}

Please generate a JSON response with the following structure:
{
  "visualDescription": "A detailed description of what the visual content should look like for ${selectedVisualType.name} on ${selectedPlatform.name}",
  "caption": "An engaging caption in ${selectedTone.name} tone that fits ${selectedPlatform.name}'s style and character limit",
  "hashtags": ["array", "of", "relevant", "hashtags", "for", "${selectedPlatform.name}"],
  "callToAction": "A platform-specific call to action that encourages engagement"
}

Make sure the caption is appropriate for ${selectedPlatform.name} and stays well within the ${selectedPlatform.limit} character limit when combined with hashtags. The content should be engaging, authentic, and aligned with the ${selectedTone.name} tone for ${inputs.targetAudience}.

Return only the JSON object, no additional text.
        `;

        result = await model.generateContent(textPrompt);
      }

      const response = await result.response;
      const text = response.text();
      
      // Parse the AI response
      let aiContent;
      try {
        // Clean the response in case it has markdown formatting
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        aiContent = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        throw new Error('Failed to parse AI response');
      }

      // Validate and format the response
      const content: GeneratedContent = {
        visualDescription: aiContent.visualDescription || 'No visual description generated',
        caption: aiContent.caption || 'No caption generated',
        hashtags: Array.isArray(aiContent.hashtags) ? aiContent.hashtags : [],
        callToAction: aiContent.callToAction || 'Engage with this post!',
        characterCount: (aiContent.caption + ' ' + (aiContent.hashtags || []).join(' ')).length
      };
      
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      
      // Fallback to mock content if AI fails
      const fallbackContent: GeneratedContent = {
        visualDescription: mode === 'image' 
          ? 'Unable to analyze the uploaded image. Please try again or check your API key.'
          : `A ${selectedVisualType.name.toLowerCase()} for ${selectedPlatform.name} showcasing ${inputs.topic} with ${inputs.brand}'s branding.`,
        caption: mode === 'image'
          ? `Check out this amazing image! At ${inputs.brand}, we love sharing visual content with our community.`
          : `🚀 Exciting update about ${inputs.topic}! At ${inputs.brand}, we're passionate about ${inputs.brandDescription}. Perfect for ${inputs.targetAudience} looking to stay ahead.`,
        hashtags: mode === 'image'
          ? [`#${inputs.brand.replace(/\s+/g, '')}`, '#VisualContent', '#Community', '#Share']
          : [`#${inputs.topic.replace(/\s+/g, '')}`, `#${inputs.brand.replace(/\s+/g, '')}`, '#Innovation', '#Growth'],
        callToAction: 'What do you think? Share your thoughts below!',
        characterCount: 0
      };
      fallbackContent.characterCount = (fallbackContent.caption + ' ' + fallbackContent.hashtags.join(' ')).length;
      
      setGeneratedContent(fallbackContent);
      
      // Show error message to user (you might want to add an error state)
      alert('AI generation failed. Using fallback content. Please check your API key configuration.');
    }
    
    setIsGenerating(false);
  };

  // Helper function to convert file to format needed by Gemini
  const fileToGenerativePart = async (file: File): Promise<any> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        const base64 = base64Data.split(',')[1];
        resolve({
          inlineData: {
            data: base64,
            mimeType: file.type,
          },
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  const copyToClipboard = async () => {
    if (!generatedContent) return;

    const fullPost = `VISUAL: ${generatedContent.visualDescription}\n\nCAPTION: ${generatedContent.caption}\n\n${generatedContent.hashtags.join(' ')}\n\nCTA: ${generatedContent.callToAction}`;
    await navigator.clipboard.writeText(fullPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateInput = (field: keyof ContentInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
      }`}>
      {/* Header */}
      <div className={`backdrop-blur-sm border-b sticky top-0 z-10 transition-colors duration-300 ${darkMode
          ? 'bg-gray-800/80 border-gray-700/50'
          : 'bg-white/80 border-gray-200/50'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Professional Social Media Generator
                </h1>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Create engaging posts with AI-powered content generation
                </p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-xl transition-all duration-200 ${darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Mode Toggle */}
            <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-xl transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-800/70 border-gray-700/50' 
                : 'bg-white/70 border-gray-200/50'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 flex items-center ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Sparkles className="h-5 w-5 mr-2 text-indigo-600" />
                Content Type
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('text')}
                  className={`p-4 rounded-xl transition-all duration-200 border-2 flex items-center justify-center space-x-2 ${
                    mode === 'text'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 scale-105'
                      : darkMode
                      ? 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:scale-102'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:scale-102'
                  }`}
                >
                  <Type className="h-5 w-5" />
                  <span className={`font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Text to Post</span>
                </button>
                <button
                  onClick={() => setMode('image')}
                  className={`p-4 rounded-xl transition-all duration-200 border-2 flex items-center justify-center space-x-2 ${
                    mode === 'image'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 scale-105'
                      : darkMode
                      ? 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:scale-102'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:scale-102'
                  }`}
                >
                  <ImageIcon className="h-5 w-5" />
                  <span className={`font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Image to Caption</span>
                </button>
              </div>
            </div>

            {/* Platform Selection */}
            <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-xl transition-colors duration-300 ${darkMode
                ? 'bg-gray-800/70 border-gray-700/50'
                : 'bg-white/70 border-gray-200/50'
              }`}>
              <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Choose Platform
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => {
                      setSelectedPlatform(platform);
                      updateInput('platform', platform.name);
                    }}
                    className={`p-4 rounded-xl transition-all duration-200 border-2 ${selectedPlatform.name === platform.name
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-105'
                        : darkMode
                          ? 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:scale-102'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:scale-102'
                      }`}
                  >
                    <platform.icon className={`h-6 w-6 mx-auto mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`} />
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'
                      }`}>{platform.name}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>{platform.limit} chars</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Information */}
            <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-xl transition-colors duration-300 ${darkMode
                ? 'bg-gray-800/70 border-gray-700/50'
                : 'bg-white/70 border-gray-200/50'
              }`}>
              <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                <Building className="h-5 w-5 mr-2 text-purple-600" />
                Brand Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Brand/Business Name
                  </label>
                  <input
                    type="text"
                    value={inputs.brand}
                    onChange={(e) => updateInput('brand', e.target.value)}
                    placeholder="e.g., TechStart Solutions"
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Brand Description
                  </label>
                  <textarea
                    value={inputs.brandDescription}
                    onChange={(e) => updateInput('brandDescription', e.target.value)}
                    placeholder="Brief description of what your brand does..."
                    rows={3}
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  />
                </div>
              </div>
            </div>

            {/* Topic Input / Image Upload */}
            {mode === 'text' ? (
              <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-xl transition-colors duration-300 ${darkMode
                  ? 'bg-gray-800/70 border-gray-700/50'
                  : 'bg-white/70 border-gray-200/50'
                }`}>
                <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  <Type className="h-5 w-5 mr-2 text-green-600" />
                  Topic/Theme
                </h2>
                <input
                  type="text"
                  value={inputs.topic}
                  onChange={(e) => updateInput('topic', e.target.value)}
                  placeholder="e.g., productivity tips, new product launch, industry insights..."
                  className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg ${darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                    }`}
                />
              </div>
            ) : (
              <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-xl transition-colors duration-300 ${darkMode
                  ? 'bg-gray-800/70 border-gray-700/50'
                  : 'bg-white/70 border-gray-200/50'
                }`}>
                <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  <Upload className="h-5 w-5 mr-2 text-green-600" />
                  Upload Image
                </h2>
                
                {!imagePreview ? (
                  <div className="space-y-4">
                    <label className={`relative cursor-pointer block w-full p-8 border-2 border-dashed rounded-xl transition-all duration-200 hover:border-blue-500 ${darkMode
                        ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                      }`}>
                      <div className="text-center">
                        <Upload className={`mx-auto h-12 w-12 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                          Click to upload an image
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Uploaded"
                        className="w-full max-h-64 object-cover rounded-xl"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      Image uploaded successfully! Click generate to create captions.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Target Audience */}
            <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-xl transition-colors duration-300 ${darkMode
                ? 'bg-gray-800/70 border-gray-700/50'
                : 'bg-white/70 border-gray-200/50'
              }`}>
              <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                <Users className="h-5 w-5 mr-2 text-orange-600" />
                Target Audience
              </h2>
              <select
                value={inputs.targetAudience}
                onChange={(e) => updateInput('targetAudience', e.target.value)}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                  }`}
              >
                <option value="">Select target audience...</option>
                {audienceTypes.map((audience) => (
                  <option key={audience} value={audience}>{audience}</option>
                ))}
              </select>
            </div>

            {/* Tone & Visual Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tone Selection */}
              <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-xl transition-colors duration-300 ${darkMode
                  ? 'bg-gray-800/70 border-gray-700/50'
                  : 'bg-white/70 border-gray-200/50'
                }`}>
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Tone</h2>
                <div className="grid grid-cols-2 gap-2">
                  {tones.map((tone) => (
                    <button
                      key={tone.name}
                      onClick={() => {
                        setSelectedTone(tone);
                        updateInput('tone', tone.name);
                      }}
                      className={`p-3 rounded-xl transition-all duration-200 border-2 text-left ${selectedTone.name === tone.name
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 scale-105'
                          : darkMode
                            ? 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:scale-102'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:scale-102'
                        }`}
                    >
                      <div className="text-lg mb-1">{tone.emoji}</div>
                      <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'
                        }`}>{tone.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Type */}
              <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-xl transition-colors duration-300 ${darkMode
                  ? 'bg-gray-800/70 border-gray-700/50'
                  : 'bg-white/70 border-gray-200/50'
                }`}>
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Visual Type</h2>
                <div className="grid grid-cols-2 gap-2">
                  {visualTypes.map((type) => (
                    <button
                      key={type.name}
                      onClick={() => setSelectedVisualType(type)}
                      className={`p-3 rounded-xl transition-all duration-200 border-2 ${selectedVisualType.name === type.name
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30 scale-105'
                          : darkMode
                            ? 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:scale-102'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:scale-102'
                        }`}
                    >
                      <type.icon className={`h-4 w-4 mx-auto mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`} />
                      <p className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'
                        }`}>{type.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateContent}
              disabled={
                isGenerating || 
                !inputs.brand.trim() || 
                (mode === 'text' && !inputs.topic.trim()) || 
                (mode === 'image' && !uploadedImage)
              }
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-xl"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>
                    {mode === 'image' 
                      ? 'Analyzing Image & Generating Content...' 
                      : 'Generating Professional Content...'
                    }
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>
                    {mode === 'image' 
                      ? 'Generate Caption from Image' 
                      : 'Generate Content'
                    }
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            {generatedContent && (
              <>
                {/* Visual Description */}
                <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-xl transition-colors duration-300 ${darkMode
                    ? 'bg-gray-800/70 border-gray-700/50'
                    : 'bg-white/70 border-gray-200/50'
                  }`}>
                  <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    <Camera className="h-5 w-5 mr-2 text-purple-600" />
                    Visual Description
                  </h2>
                  <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <p className={`leading-relaxed ${darkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                      {generatedContent.visualDescription}
                    </p>
                  </div>
                </div>

                {/* Generated Caption */}
                <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-xl transition-colors duration-300 ${darkMode
                    ? 'bg-gray-800/70 border-gray-700/50'
                    : 'bg-white/70 border-gray-200/50'
                  }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl font-semibold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                      Caption
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${generatedContent.characterCount > selectedPlatform.limit
                          ? 'text-red-600'
                          : 'text-green-600'
                        }`}>
                        {generatedContent.characterCount}/{selectedPlatform.limit}
                      </span>
                      <button
                        onClick={copyToClipboard}
                        className={`p-2 rounded-lg transition-colors duration-200 ${darkMode
                            ? 'bg-blue-800 hover:bg-blue-700'
                            : 'bg-blue-100 hover:bg-blue-200'
                          }`}
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-blue-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <p className={`leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                      {generatedContent.caption}
                    </p>
                  </div>
                </div>

                {/* Hashtags */}
                <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-xl transition-colors duration-300 ${darkMode
                    ? 'bg-gray-800/70 border-gray-700/50'
                    : 'bg-white/70 border-gray-200/50'
                  }`}>
                  <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    <Hash className="h-5 w-5 mr-2 text-blue-600" />
                    Hashtags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.hashtags.map((hashtag, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${darkMode
                            ? 'bg-blue-800 text-blue-200 hover:bg-blue-700'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                      >
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Call to Action */}
                <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-xl transition-colors duration-300 ${darkMode
                    ? 'bg-gray-800/70 border-gray-700/50'
                    : 'bg-white/70 border-gray-200/50'
                  }`}>
                  <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    <ArrowRight className="h-5 w-5 mr-2 text-orange-600" />
                    Call to Action
                  </h2>
                  <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <p className={`leading-relaxed ${darkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                      {generatedContent.callToAction}
                    </p>
                  </div>
                </div>

                {/* Platform Preview */}
                <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-xl transition-colors duration-300 ${darkMode
                    ? 'bg-gray-800/70 border-gray-700/50'
                    : 'bg-white/70 border-gray-200/50'
                  }`}>
                  <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    <Eye className="h-5 w-5 mr-2 text-indigo-600" />
                    {selectedPlatform.name} Preview
                  </h2>
                  <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-900'
                    } text-white`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <selectedPlatform.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{inputs.brand || 'Your Brand'}</p>
                        <p className="text-sm text-gray-400">@{inputs.brand.toLowerCase().replace(/\s+/g, '') || 'yourhandle'}</p>
                      </div>
                    </div>
                    <p className="text-gray-100 mb-3 leading-relaxed">
                      {generatedContent.caption}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {generatedContent.hashtags.map((hashtag, index) => (
                        <span key={index} className="text-blue-400 text-sm">
                          {hashtag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-6 text-gray-400 text-sm">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>234</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>45</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share className="h-4 w-4" />
                        <span>12</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!generatedContent && (
              <div className={`backdrop-blur-sm rounded-2xl p-12 border shadow-xl text-center transition-colors duration-300 ${darkMode
                  ? 'bg-gray-800/50 border-gray-700/50'
                  : 'bg-white/50 border-gray-200/50'
                }`}>
                <Sparkles className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Ready to create professional content?</h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Fill in your brand details and topic to generate engaging social media content!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;