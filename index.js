var self = require('sdk/self');

function dummy(text, callback) {
  callback(text);
}

exports.dummy = dummy;

var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");

var button = buttons.ActionButton({
  id: "mozilla-link",
  label: "ADANADO",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: handleChange
});

function handleChange(state) {
	const { Panel } = require('sdk/panel');
	let panel = Panel({
		contentURL:require("sdk/self").data.url("panel.html"),

	});
 panel.show({
      position: button
    });
}

