const Meeting = require("../models/meeting")
const Group = require("../models/group")

// Add Meeting to Group
const addMeeting = async (req, res) => {
    try {
        const{ title, time, content, groupId, status, location, date} = req.body;

        // Validate Inputes
        if(!title || !time || !content || !groupId || !location || !date){
            return res.status(400).json({message:"missing required fields"})
        }

        const group = await Group.findById(groupId)
        if(!group){
            return res.status(404).json({message:"Group not found"})
        }

        const existingMeeting = await Meeting.findOne({title, group: groupId});
        if(existingMeeting){
            return res.status(400).json({message: "Meeting already exists"})
        }

        const newMeeting = new Meeting({title, time, content, status, group: groupId, location, date})
        await newMeeting.save()

        group.meetings.push(newMeeting._id)
        await group.save()

        return res.status(201).json({message: "Meeting added successfully", newMeeting})
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

//Get all meetings in a group
const getGroupMeetings = async (req, res) => {
    try {
        const {groupId} = req.params;
        const meetings = await Meeting.find({group: groupId});
        return res.status(200).json(meetings)
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Update a meeting
const updateMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { title, time, content, status, location, date } = req.body;

        // Find the meeting
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        // Update meeting fields
        meeting.title = title || meeting.title;
        meeting.time = time || meeting.time;
        meeting.content = content || meeting.content;
        meeting.status = status || meeting.status;
        meeting.location = location || meeting.location;
        meeting.date = date || meeting.date;

        // Save the updated meeting
        await meeting.save();

        return res.status(200).json({ message: "Meeting updated successfully", meeting });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Delete a meeting
const deleteMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;

        // Find the meeting
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        // Remove meeting from group's meetings array
        await Group.findByIdAndUpdate(
            meeting.group,
            { $pull: { meetings: meetingId } }
        );

        // Delete the meeting
        await Meeting.findByIdAndDelete(meetingId);

        return res.status(200).json({ message: "Meeting deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = { addMeeting, getGroupMeetings, updateMeeting, deleteMeeting };