/*
	Copyright (C) 2014  PencilBlue, LLC

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
* Interface for editing a user
*/

function UserForm(){}

//inheritance
util.inherits(UserForm, pb.BaseController);

//statics
var SUB_NAV_KEY = 'user_form';

UserForm.prototype.render = function(cb) {
	var self = this;
	var vars = this.pathVars;

	this.gatherData(vars, function(err, data) {
		if(util.isError(err)) {
			throw err;
		}
		else if(!data.user) {
			self.reqHandler.serve404();
			return;
		}

		self.user = data.user;
		data.pills = pb.AdminSubnavService.get(SUB_NAV_KEY, self.ls, SUB_NAV_KEY, {session: self.session, user: self.user});

		data.adminOptions = [{name: self.ls.get('ADMINISTRATOR'), value: ACCESS_ADMINISTRATOR}];
		if(!data.user._id || self.session.authentication.user_id !== data.user._id.toString()) {
			data.adminOptions = pb.users.getAdminOptions(self.session, self.localizationService);
		}

		var angularObjects = pb.js.getAngularObjects(data);

		self.setPageName(data.user._id ? data.user.username : self.ls.get('NEW_USER'));
		self.ts.registerLocal('image_title', self.ls.get('USER_PHOTO'));
		self.ts.registerLocal('angular_script', '');
		self.ts.registerLocal('angular_objects', new pb.TemplateValue(angularObjects, false));
		self.ts.load('admin/users/user_form', function(err, result) {
			cb({content: result});
		});
	});
};

UserForm.prototype.gatherData = function(vars, cb) {
	var self = this;
	var tasks = {
		tabs: function(callback) {
			var tabs = [{
				active: 'active',
				href: '#account_info',
				icon: 'cog',
				title: self.ls.get('ACCOUNT_INFO')
			}, {
				href: '#personal_info',
				icon: 'user',
				title: self.ls.get('PERSONAL_INFO')
			}];
			callback(null, tabs);
		},

		navigation: function(callback) {
			callback(null, pb.AdminNavigation.get(self.session, ['users'], self.ls));
		},

		user: function(callback) {
			if(!vars.id) {
				callback(null, {});
				return;
			}

			var dao = new pb.DAO();
			dao.loadById(vars.id, 'user', function(err, user) {
				delete user.password;
				callback(err, user);
			});
		}
	};
	async.series(tasks, cb);
};

UserForm.getSubNavItems = function(key, ls, data) {
	var pills = [{
		name: 'manage_users',
		title: data.user._id ? ls.get('EDIT') + ' ' + data.user.username : ls.get('NEW_USER'),
		icon: 'chevron-left',
		href: '/admin/users'
	}];

	if(data.user._id) {
		if(data.session.authentication.user_id === data.user._id.toString()) {
			pills.push({
				name: 'change_password',
				title: ls.get('CHANGE_PASSWORD'),
				icon: 'key',
				href: '/admin/users/password/' + data.user._id.toString()
			});
		}
		else if(data.session.authentication.admin_level >= ACCESS_MANAGING_EDITOR) {
			pills.push({
				name: 'reset_password',
				title: ls.get('RESET_PASSWORD'),
				icon: 'key',
				href: '/actions/admin/users/send_password_reset/' + data.user._id.toString()
			});
		}
	}

	pills.push({
		name: 'new_user',
		title: '',
		icon: 'plus',
		href: '/admin/users/new'
	});

	return pills;
};

//register admin sub-nav
pb.AdminSubnavService.registerFor(SUB_NAV_KEY, UserForm.getSubNavItems);

//exports
module.exports = UserForm;
