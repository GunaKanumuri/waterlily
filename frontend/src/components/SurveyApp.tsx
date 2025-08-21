import React, {useState, useEffect} from 'react';
import { CheckCircle, User, Heart, DollarSign, AlertCircle } from 'lucide-react';
import ApiService from '../services/apiService'; // Add this import


interface Question{
    id: string;
    title: string;
    description: string;
    type: 'text' | 'number' | 'select' | 'radio' |'textarea';
    options?: string[];
    required: boolean;
    category: 'demographic' | 'health' | 'financial';
}

interface FormData{
    [key: string]: string | number;
}

interface ValidationErrors {
    [key: string]: string;
}

const SurveyApp: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({});
    const[errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<number>(0);

    const questions: Question[] = [
        {
        id: 'fullName',
        title: 'Full Name',
        description: 'Please enter your full name',
        type: 'text',
        required: true,
        category: 'demographic'
        },
        {
        id: 'age',
        title: 'Age',
        description: 'Your age in years',
        type: 'number',
        required: true,
        category: 'demographic'
        },
        {
        id: 'gender',
        title: 'Gender',
        description: 'Please enter your gender identity.',
        type: 'radio',
        options: ['Male', 'Female', 'Prefer not to say',],
        required: true,
        category: 'demographic'
        },
        {
        id: 'maritalStatus',
        title: 'Martial Status',
        description: 'Your current marital status',
        type: 'radio',
        options: ['Single','Married','Divorced','Widowed',],
        required: true,
        category: 'demographic'
        },
        {
        id: 'healthStatus',
        title: 'Health Status',
        description: 'How would you rate your current overall health?',
        type: 'radio',
        options: ['Excellent','Very Good','Good','Fair','Poor',],
        required: true,
        category: 'health'
        },
        {
        id: 'ChronicConditions',
        title: 'Chronic Helath Conditions',
        description: 'Please describe any chronic health conditions you have been diagnosed with.(Optional)',
        type: 'textarea',
        required: false,
        category: 'health'
        },
        {
        id: 'medications',
        title: 'Current Medications',
        description: 'List any medications you currently take.(Optional)',
        type: 'textarea',
        required: false,
        category: 'health'
        }, 
        {
        id: 'annualIncome',
        title: 'Annual household Income',
        description: 'Please select your total annual household income before taxes.',
        type: 'select',
        options: ['Less than $25,000','$25,000 - $49,999','$50,000 - $74,999','$75,000 - $99,999','$100,000 - $149,999','$150,000 and above',],
        required: true,
        category: 'financial',
        },
        {
        id: 'hasInsurance',
        title: 'Health insurance coverage',
        description: 'Do you currently have health insurance coverage?',
        type: 'radio',
        options: ['Yes','No',],
        required: true,
        category: 'financial',
        },
        {
        id: 'savingsAccount',
        title: 'Emergency Savings',
        description: 'Do you have an emergency savings fund that can cover at least 3+ months of living expenses?',
        type: 'radio',
        options: ['Yes','No',],
        required: false,
        category: 'financial',
        }
    ];

    const questionsByCategory = {
        demographics: questions.filter(q => q.category === 'demographic'),
        health: questions.filter(q => q.category === 'health'),
        financial: questions.filter(q => q.category === 'financial'),
    };

    const categories = ['demographics', 'health', 'financial'] as const;
    const currentQuestions = questionsByCategory[categories[currentStep]];

    const getCategoryIcon = (category: string) => {
        switch(category) {
            case 'demographic':
                return <User className="w-6 h-6 text-blue-500"/>;
            case 'health':
                return <Heart className="w-6 h-6 text-red-500"/>;
            case 'financial':
                return <DollarSign className="w-6 h-6 text-green-500"/>;
            default:
                return <AlertCircle className="w-6 h-6 text-gray-500"/>;
        }
    };
    //Handling the input changes
    const handleInputChange = (questionId: string, value: string |number) => {
        setFormData(prev => ({
            ...prev,
            [questionId]: value
        }));

        if (errors[questionId]){
            setErrors(prev => ({
                ...prev,
                [questionId]: ''
        }));
        }
    };

    //validating current step
    const validateCurrentStep = () => {
        const newErrors: ValidationErrors = {};
            let isValid = true;

        currentQuestions.forEach(question => {
            const value = formData[question.id];

            if (question.required && (!value || value.toString().trim() === '')){
                newErrors[question.id] = `${question.title} is required.`;
                isValid = false;
            }

            if (question.type === 'number' && value){
                const numValue = Number(value);
                if (isNaN(numValue) ||numValue < 0){
                    newErrors[question.id] = `Please enter a must be a valid number.`;
                    isValid = false;
                }
            }
        });

        setErrors(newErrors);
        return isValid;
    };
     
    //Handling next step
    const handleNextStep = () => {
        if (validateCurrentStep()){
            if (currentStep < categories.length -1){
                setCurrentStep(prev => prev + 1);
            } else {
                setIsSubmitted(true);
            }
        }
    };

    //Handling previous step
    const handlePreviousStep = () => {  
        if (currentStep > 0){
            setCurrentStep(prev => prev -1);
        }
    };

    const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    //await new Promise(resolve => setTimeout(resolve, 1500));
    
    //setIsSubmitted(true);
    //setIsSubmitting(false);
    //integration with ApiService
    try {
    const response = await ApiService.submitSurvey(formData);
    
    if (response.success) {
      setIsSubmitted(true);
    } else {
      alert('Submission failed: ' + response.message);
    }
  } catch (error) {
    alert('Network error occurred');
  } finally {
    setIsSubmitting(false);
  }
  };

  const renderInputField = (question: Question) => {
  const value = formData[question.id] || '';
  const hasError = !!errors[question.id];
  
  const baseInputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
    hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
  }`;

  switch (question.type) {
    case 'text':
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(question.id, e.target.value)}
          className={baseInputClasses}
          placeholder={question.description}
        />
      );
    
    case 'number':
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleInputChange(question.id, parseInt(e.target.value) || '')}
          className={baseInputClasses}
          placeholder={question.description}
          min="0"
        />
      );
    
    case 'textarea':
      return (
        <textarea
          value={value}
          onChange={(e) => handleInputChange(question.id, e.target.value)}
          className={`${baseInputClasses} h-32 resize-none`}
          placeholder={question.description}
        />
      );
    
    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => handleInputChange(question.id, e.target.value)}
          className={baseInputClasses}
        >
          <option value="">{question.description}</option>
          {question.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    
    case 'radio':
      return (
        <div className="space-y-3">
          {question.options?.map((option) => (
            <label key={option} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      );
    
    default:
      return null;
  }
};
  const progress = (currentStep / categories.length) * 100;

  // Success page
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Survey Completed!</h1>
            <p className="text-gray-600">Thank you for providing your information. Your responses have been recorded.</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Responses:</h2>
            <div className="space-y-4">
              {questions.map((question) => {
                const response = formData[question.id];
                if (!response) return null;
                
                return (
                  <div key={question.id} className="border-b border-gray-200 pb-3">
                    <p className="font-medium text-gray-700">{question.title}:</p>
                    <p className="text-gray-600 mt-1">{response}</p>
                  </div>
                );
              })}
            </div>
          </div>
          
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({});
              setCurrentStep(0);
              setErrors({});
            }}
            className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Take Survey Again
          </button>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg mb-6 p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Waterlily Health Assessment</h1>
            <p className="text-gray-600">Help us understand your needs for personalized long-term care planning</p>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="flex justify-center space-x-8 mb-6">
            {categories.map((category, index) => (
              <div key={category} className={`flex items-center space-x-2 ${
                index === currentStep ? 'text-blue-600' : index < currentStep ? 'text-green-600' : 'text-gray-400'
              }`}>
                {getCategoryIcon(category)}
                <span className="font-medium capitalize">{category}</span>
                {index < currentStep && <CheckCircle className="w-4 h-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              {getCategoryIcon(categories[currentStep])}
              <h2 className="text-2xl font-bold text-gray-800 capitalize">
                {categories[currentStep]} Information
              </h2>
            </div>
            <p className="text-gray-700 font-medium text-left">
              {categories[currentStep] === 'demographics' && 'Basic information about yourself'}
              {categories[currentStep] === 'health' && 'Your current health status and medical history'}
              {categories[currentStep] === 'financial' && 'Financial information for care planning'}
            </p>
          </div>

          <div className="space-y-8">
            {currentQuestions.map((question) => (
              <div key={question.id} className="space-y-3">
                <div className="flex items-start space-x-2"> {/* Question Header */}
                  <label className="text-lg font-semibold text-gray-800">
                    {question.title}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                </div>

                {/* Input field */}
                {renderInputField(question)}
                
                {errors[question.id] && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors[question.id]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-12">
            <button
              onClick={handlePreviousStep}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentStep === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              Previous
            </button>

            {currentStep < categories.length - 1 ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 text-white ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Complete Survey'}
              </button>
            )}
          </div>
        </div>

        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>Your information is secure and will be used only for care planning analysis - Guna Kanumuri</p>
        </div>
      </div>
    </div>
  );
};

export default SurveyApp;