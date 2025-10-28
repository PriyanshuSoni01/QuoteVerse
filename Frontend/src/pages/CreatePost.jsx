import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, resetCreateState } from '../../slices/PostsSlice.js';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTag, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { createLoading, createError, createSuccess } = useSelector((state) => state.posts);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'quote',
    tags: []
  });
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    if (createSuccess) {
      toast.success('Post created successfully!');
      dispatch(resetCreateState());
      navigate('/feed');
    }
  }, [createSuccess, dispatch, navigate]);

  useEffect(() => {
    if (createError) {
      toast.error(createError);
    }
  }, [createError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await dispatch(createPost(formData)).unwrap();
    } catch (error) {
      // Error is handled by useEffect
    }
  };

  const getPlaceholderText = () => {
    switch (formData.type) {
      case 'quote':
        return 'Share an inspiring quote that moved you...';
      case 'poem':
        return 'Express your feelings through poetry...';
      case 'thought':
        return 'Share your thoughts and reflections...';
      default:
        return 'Write your content here...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/feed')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
          </div>
          <p className="text-gray-600">
            Share your quotes, poems, and thoughts with the community
          </p>
        </div>

        {/* Create Post Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          {/* Post Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Post Type
            </label>
            <div className="flex gap-3">
              {[
                { value: 'quote', label: 'Quote', color: 'blue' },
                { value: 'poem', label: 'Poem', color: 'purple' },
                { value: 'thought', label: 'Thought', color: 'green' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.type === type.value
                      ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Give your post a catchy title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder={getPlaceholderText()}
              rows={formData.type === 'poem' ? 8 : 6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              {formData.content.length}/500 characters
            </p>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tags to categorize your post..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={addTag}
                disabled={!currentTag.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>

            {/* Tags Display */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 p-0.5 hover:bg-gray-200 rounded-full"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          {(formData.title || formData.content) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
              <div className="bg-white p-4 rounded border">
                {formData.title && (
                  <h4 className="font-semibold text-gray-900 mb-2">{formData.title}</h4>
                )}
                {formData.content && (
                  <p className={`text-gray-700 ${formData.type === 'poem' ? 'whitespace-pre-line' : ''}`}>
                    {formData.content}
                  </p>
                )}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/feed')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading || !formData.title.trim() || !formData.content.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                'Create Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;