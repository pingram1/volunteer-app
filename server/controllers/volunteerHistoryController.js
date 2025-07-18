const volunteerHistoryModel = require('../models/volunteerHistoryModel');
const userModel = require('../models/userModel');

// Get volunteer history by volunteer ID
const getVolunteerHistory = async (req, res) => {
    try {
        const { volunteerId } = req.params;
        const history = volunteerHistoryModel.getHistoryByVolunteerId(parseInt(volunteerId));
        
        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error getting volunteer history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get volunteer history',
            error: error.message
        });
    }
};

// Get a specific history entry by ID
const getHistoryEntryById = async (req, res) => {
    try {
        const { id } = req.params;
        const entry = volunteerHistoryModel.getHistoryById(id);
        
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'History entry not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: entry
        });
    } catch (error) {
        console.error('Error getting history entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get history entry',
            error: error.message
        });
    }
};

// Create a new history entry
const createHistoryEntry = async (req, res) => {
    try {
        const { volunteerId, eventId, eventName, eventDate, eventLocation, status } = req.body;
        
        if (!volunteerId || !eventId || !eventName || !eventDate || !eventLocation) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided: volunteerId, eventId, eventName, eventDate, eventLocation'
            });
        }
        
        const entry = volunteerHistoryModel.createHistoryEntry({
            volunteerId: parseInt(volunteerId),
            eventId: parseInt(eventId),
            eventName,
            eventDate,
            eventLocation,
            status
        });
        
        res.status(201).json({
            success: true,
            data: entry,
            message: 'History entry created successfully'
        });
    } catch (error) {
        console.error('Error creating history entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create history entry',
            error: error.message
        });
    }
};

// Update a history entry
const updateHistoryEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const entry = volunteerHistoryModel.updateHistoryEntry(id, updateData);
        
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'History entry not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: entry,
            message: 'History entry updated successfully'
        });
    } catch (error) {
        console.error('Error updating history entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update history entry',
            error: error.message
        });
    }
};

// Complete an event (mark as completed with details)
const completeEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { hoursWorked, skillsUsed, feedback, rating } = req.body;
        
        if (!hoursWorked) {
            return res.status(400).json({
                success: false,
                message: 'Hours worked is required'
            });
        }
        
        const entry = volunteerHistoryModel.completeEvent(id, {
            hoursWorked: parseInt(hoursWorked),
            skillsUsed: skillsUsed || [],
            feedback,
            rating: rating ? parseInt(rating) : null
        });
        
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'History entry not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: entry,
            message: 'Event completed successfully'
        });
    } catch (error) {
        console.error('Error completing event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete event',
            error: error.message
        });
    }
};

// Get volunteer statistics
const getVolunteerStats = async (req, res) => {
    try {
        const { volunteerId } = req.params;
        const stats = volunteerHistoryModel.getVolunteerStats(parseInt(volunteerId));
        
        // Get volunteer details
        const volunteer = userModel.findVolById(parseInt(volunteerId));
        
        res.status(200).json({
            success: true,
            data: {
                volunteer: volunteer ? {
                    id: volunteer.id,
                    name: volunteer.name,
                    skills: volunteer.skills,
                    location: volunteer.location
                } : null,
                stats
            }
        });
    } catch (error) {
        console.error('Error getting volunteer stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get volunteer stats',
            error: error.message
        });
    }
};

// Get top volunteers
const getTopVolunteers = async (req, res) => {
    try {
        const { limit } = req.query;
        const topVolunteers = volunteerHistoryModel.getTopVolunteers(limit ? parseInt(limit) : 10);
        
        // Enrich with volunteer details
        const enrichedTopVolunteers = topVolunteers.map(volunteer => {
            const volunteerDetails = userModel.findVolById(volunteer.volunteerId);
            return {
                ...volunteer,
                volunteerName: volunteerDetails ? volunteerDetails.name : 'Unknown',
                volunteerSkills: volunteerDetails ? volunteerDetails.skills : []
            };
        });
        
        res.status(200).json({
            success: true,
            data: enrichedTopVolunteers
        });
    } catch (error) {
        console.error('Error getting top volunteers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get top volunteers',
            error: error.message
        });
    }
};

// Get event history
const getEventHistory = async (req, res) => {
    try {
        const { eventId } = req.params;
        const eventHistory = volunteerHistoryModel.getEventHistory(parseInt(eventId));
        
        // Enrich with volunteer details
        const enrichedEventHistory = eventHistory.map(entry => {
            const volunteer = userModel.findVolById(entry.volunteerId);
            return {
                ...entry,
                volunteerName: volunteer ? volunteer.name : 'Unknown',
                volunteerSkills: volunteer ? volunteer.skills : []
            };
        });
        
        res.status(200).json({
            success: true,
            data: enrichedEventHistory
        });
    } catch (error) {
        console.error('Error getting event history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get event history',
            error: error.message
        });
    }
};

// Delete a history entry
const deleteHistoryEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const entry = volunteerHistoryModel.deleteHistoryEntry(id);
        
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'History entry not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'History entry deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting history entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete history entry',
            error: error.message
        });
    }
};

// Get all history (admin endpoint)
const getAllHistory = async (req, res) => {
    try {
        const allHistory = volunteerHistoryModel.getAllHistory();
        
        res.status(200).json({
            success: true,
            data: allHistory
        });
    } catch (error) {
        console.error('Error getting all history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get all history',
            error: error.message
        });
    }
};

module.exports = {
    getVolunteerHistory,
    getHistoryEntryById,
    createHistoryEntry,
    updateHistoryEntry,
    completeEvent,
    getVolunteerStats,
    getTopVolunteers,
    getEventHistory,
    deleteHistoryEntry,
    getAllHistory
}; 