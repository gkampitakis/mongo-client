const tasks = commands => commands.join(' && ');

module.exports = {
	hooks: {
		'pre-push': tasks(['npm t', 'echo "Pushing Verified Branch"'])
	}
};
