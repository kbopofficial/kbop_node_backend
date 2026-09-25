const express = require('express');
const router = express.Router();
const { getAllTeamMembers, syncTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } = require('./team.controller');

router.get('/sync', syncTeamMembers);
router.get('/', getAllTeamMembers);
router.post('/', createTeamMember);
router.put('/:id', updateTeamMember);
router.delete('/:id', deleteTeamMember);

module.exports = router;
