const Announcement = require("../models/announcement");
const Group = require("../models/group");

// Add an Announcement
const addAnnouncement = async (req, res) => {
    try {
        const { title, content, groupId } = req.body;

        // Validate inputs
        if (!title || !content || !groupId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const newAnnouncement = new Announcement({ title, content, group: groupId });
        await newAnnouncement.save();

        group.announcements.push(newAnnouncement._id);
        await group.save();

        return res.status(201).json({ message: "Announcement added successfully", newAnnouncement });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all Announcements in a Group
const getGroupAnnouncements = async (req, res) => {
    try {
        const { groupId } = req.params;
        const announcements = await Announcement.find({ group: groupId });
        return res.status(200).json(announcements);
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update an Announcement
const updateAnnouncement = async (req, res) => {
    try {
        const { announcementId } = req.params;
        const { title, content } = req.body;

        const announcement = await Announcement.findById(announcementId);
        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        // Update fields
        announcement.title = title || announcement.title;
        announcement.content = content || announcement.content;

        await announcement.save();

        return res.status(200).json({ message: "Announcement updated successfully", announcement });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete an Announcement
const deleteAnnouncement = async (req, res) => {
    try {
        const { announcementId } = req.params;

        const announcement = await Announcement.findById(announcementId);
        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        // Remove from group's announcements array
        await Group.findByIdAndUpdate(
            announcement.group,
            { $pull: { announcements: announcementId } }
        );

        await Announcement.findByIdAndDelete(announcementId);

        return res.status(200).json({ message: "Announcement deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { addAnnouncement, getGroupAnnouncements, updateAnnouncement, deleteAnnouncement };
