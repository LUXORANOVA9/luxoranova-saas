/**
 * Firebase Firestore Sync Script for Luxoranova Executive AI Subbrain
 * 
 * This script provides functionality to log AI interactions from the Abascus ChatLLM node
 * to Firebase Firestore, enabling a learning loop for the AI subbrain to improve over time.
 * 
 * Features:
 * - Firebase Firestore connection and authentication
 * - Data structure for different interaction types (sales, outreach, content, investor)
 * - Functions for logging inputs, outputs, and performance metrics
 * - Retrieval of past interactions for context
 * - Error handling with retry logic
 * - Basic analytics functions
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configuration
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 300; // ms
const INTERACTION_TYPES = ['sales', 'outreach', 'content', 'investor'];

/**
 * Initialize Firebase Admin SDK
 * This function attempts to load credentials from:
 * 1. Environment variables (FIREBASE_SERVICE_ACCOUNT as JSON string)
 * 2. Service account file (./firebase-credentials.json)
 */
function initializeFirebase() {
  try {
    let serviceAccount;
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Load from environment variable
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      // Load from credentials file
      const credentialsPath = path.join(__dirname, 'firebase-credentials.json');
      if (fs.existsSync(credentialsPath)) {
        serviceAccount = require(credentialsPath);
      } else {
        throw new Error('Firebase credentials not found. Please set FIREBASE_SERVICE_ACCOUNT environment variable or provide firebase-credentials.json file.');
      }
    }
    
    // Initialize the app
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('Firebase initialized successfully');
    return admin.firestore();
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

// Initialize Firestore
const db = initializeFirebase();

/**
 * Retry function with exponential backoff
 * @param {Function} operation - The function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} initialDelay - Initial delay in milliseconds
 * @returns {Promise} - Result of the operation
 */
async function retryOperation(operation, maxRetries = MAX_RETRIES, initialDelay = INITIAL_RETRY_DELAY) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Calculate delay with exponential backoff and jitter
      const delay = initialDelay * Math.pow(2, attempt) + Math.random() * 100;
      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries}). Retrying in ${Math.round(delay)}ms...`, error.message);
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError.message}`);
}

/**
 * Generate a unique ID for an interaction
 * @returns {string} - Unique ID based on timestamp and random string
 */
function generateInteractionId() {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}`;
}

/**
 * Validate interaction type
 * @param {string} type - Interaction type to validate
 * @throws {Error} - If type is invalid
 */
function validateInteractionType(type) {
  if (!INTERACTION_TYPES.includes(type)) {
    throw new Error(`Invalid interaction type: ${type}. Must be one of: ${INTERACTION_TYPES.join(', ')}`);
  }
}

/**
 * Log an AI interaction to Firestore
 * @param {string} type - Type of interaction (sales, outreach, content, investor)
 * @param {object} input - Input data (prompt, parameters, etc.)
 * @param {object} output - Output data (AI response)
 * @param {object} metadata - Additional metadata (user, timestamp, etc.)
 * @returns {Promise<string>} - ID of the created interaction document
 */
async function logInteraction(type, input, output, metadata = {}) {
  validateInteractionType(type);
  
  const interactionId = metadata.id || generateInteractionId();
  const timestamp = metadata.timestamp || admin.firestore.FieldValue.serverTimestamp();
  
  const interactionData = {
    type,
    input,
    output,
    metadata: {
      ...metadata,
      timestamp,
      createdAt: timestamp
    },
    metrics: {
      processingTimeMs: metadata.processingTimeMs || null,
      tokenCount: metadata.tokenCount || null,
      successStatus: metadata.successStatus || true
    }
  };
  
  return retryOperation(async () => {
    const docRef = db.collection('aiInteractions').doc(type).collection('interactions').doc(interactionId);
    await docRef.set(interactionData);
    console.log(`Logged ${type} interaction with ID: ${interactionId}`);
    return interactionId;
  });
}

/**
 * Update metrics for an existing interaction
 * @param {string} type - Type of interaction
 * @param {string} interactionId - ID of the interaction to update
 * @param {object} metrics - Metrics to update
 * @returns {Promise<void>}
 */
async function updateMetrics(type, interactionId, metrics) {
  validateInteractionType(type);
  
  return retryOperation(async () => {
    const docRef = db.collection('aiInteractions').doc(type).collection('interactions').doc(interactionId);
    
    // Update metrics and add updatedAt timestamp
    await docRef.update({
      'metrics': admin.firestore.FieldValue.arrayUnion(metrics),
      'metadata.updatedAt': admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Updated metrics for ${type} interaction: ${interactionId}`);
  });
}

/**
 * Get recent interactions of a specific type
 * @param {string} type - Type of interaction to retrieve
 * @param {number} limit - Maximum number of interactions to retrieve
 * @param {object} filters - Additional filters to apply
 * @returns {Promise<Array>} - Array of interaction documents
 */
async function getRecentInteractions(type, limit = 10, filters = {}) {
  validateInteractionType(type);
  
  return retryOperation(async () => {
    let query = db.collection('aiInteractions').doc(type).collection('interactions')
      .orderBy('metadata.timestamp', 'desc')
      .limit(limit);
    
    // Apply additional filters if provided
    if (filters.successOnly) {
      query = query.where('metrics.successStatus', '==', true);
    }
    
    if (filters.startDate) {
      query = query.where('metadata.timestamp', '>=', new Date(filters.startDate));
    }
    
    if (filters.endDate) {
      query = query.where('metadata.timestamp', '<=', new Date(filters.endDate));
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      console.log(`No recent ${type} interactions found`);
      return [];
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  });
}

/**
 * Get interaction context for a new AI prompt
 * This function retrieves relevant past interactions to provide context for a new prompt
 * @param {string} type - Type of interaction
 * @param {number} contextSize - Number of past interactions to include
 * @param {object} contextFilters - Filters to apply when selecting context
 * @returns {Promise<Array>} - Array of relevant past interactions
 */
async function getInteractionContext(type, contextSize = 5, contextFilters = {}) {
  return getRecentInteractions(type, contextSize, contextFilters);
}

/**
 * Calculate success rate for a specific interaction type
 * @param {string} type - Type of interaction
 * @param {object} timeRange - Time range for the calculation (startDate, endDate)
 * @returns {Promise<number>} - Success rate as a percentage
 */
async function calculateSuccessRate(type, timeRange = {}) {
  validateInteractionType(type);
  
  return retryOperation(async () => {
    let query = db.collection('aiInteractions').doc(type).collection('interactions');
    
    if (timeRange.startDate) {
      query = query.where('metadata.timestamp', '>=', new Date(timeRange.startDate));
    }
    
    if (timeRange.endDate) {
      query = query.where('metadata.timestamp', '<=', new Date(timeRange.endDate));
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      console.log(`No ${type} interactions found for success rate calculation`);
      return null;
    }
    
    const total = snapshot.size;
    const successful = snapshot.docs.filter(doc => doc.data().metrics.successStatus).length;
    
    return (successful / total) * 100;
  });
}

/**
 * Calculate average response time for a specific interaction type
 * @param {string} type - Type of interaction
 * @param {object} timeRange - Time range for the calculation (startDate, endDate)
 * @returns {Promise<number>} - Average response time in milliseconds
 */
async function calculateAverageResponseTime(type, timeRange = {}) {
  validateInteractionType(type);
  
  return retryOperation(async () => {
    let query = db.collection('aiInteractions').doc(type).collection('interactions');
    
    if (timeRange.startDate) {
      query = query.where('metadata.timestamp', '>=', new Date(timeRange.startDate));
    }
    
    if (timeRange.endDate) {
      query = query.where('metadata.timestamp', '<=', new Date(timeRange.endDate));
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      console.log(`No ${type} interactions found for response time calculation`);
      return null;
    }
    
    const interactions = snapshot.docs.map(doc => doc.data());
    const validInteractions = interactions.filter(interaction => 
      interaction.metrics && typeof interaction.metrics.processingTimeMs === 'number'
    );
    
    if (validInteractions.length === 0) {
      return null;
    }
    
    const totalTime = validInteractions.reduce((sum, interaction) => 
      sum + interaction.metrics.processingTimeMs, 0
    );
    
    return totalTime / validInteractions.length;
  });
}

/**
 * Get analytics for a specific interaction type
 * @param {string} type - Type of interaction
 * @param {object} options - Options for analytics calculation
 * @returns {Promise<object>} - Analytics data
 */
async function getAnalytics(type, options = {}) {
  validateInteractionType(type);
  
  const timeRange = {
    startDate: options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: last 30 days
    endDate: options.endDate || new Date()
  };
  
  const [successRate, averageResponseTime, recentInteractions] = await Promise.all([
    calculateSuccessRate(type, timeRange),
    calculateAverageResponseTime(type, timeRange),
    getRecentInteractions(type, 100, timeRange)
  ]);
  
  // Calculate additional metrics
  const totalInteractions = recentInteractions.length;
  
  // Count interactions by day
  const interactionsByDay = recentInteractions.reduce((acc, interaction) => {
    const date = new Date(interaction.metadata.timestamp.toDate()).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  
  return {
    type,
    timeRange,
    metrics: {
      successRate,
      averageResponseTime,
      totalInteractions
    },
    interactionsByDay
  };
}

// Export functions for use in n8n custom node
module.exports = {
  logInteraction,
  updateMetrics,
  getRecentInteractions,
  getInteractionContext,
  calculateSuccessRate,
  calculateAverageResponseTime,
  getAnalytics
};
