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


module.exports = { addMeeting, getGroupMeetings };
