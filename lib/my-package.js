'use babel';

import MyPackageView from './my-package-view';
import { CompositeDisposable } from 'atom';

export default {

	myPackageView: null,
	modalPanel: null,
	subscriptions: null,

	activate(state) {
		this.myPackageView = new MyPackageView(state.myPackageViewState);
		this.modalPanel = atom.workspace.addModalPanel({
			item: this.myPackageView.getElement(),
			visible: false
		});
		// Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
		this.subscriptions = new CompositeDisposable();
		
		// Register command that toggles this view
		
		this.toggle();
	},

	deactivate() {
		this.modalPanel.destroy();
		this.subscriptions.dispose();
		this.myPackageView.destroy();
	},

	serialize() {
		return {
			myPackageViewState: this.myPackageView.serialize()
		};
	},

	toggle() {
		this.notify();
		atom.workspace.observeTextEditors((editor) => {
			editor.onDidStopChanging(this.notify);
			editor.onDidChangeScrollTop(this.notify);
			editor.onDidChangeCursorPosition(this.notify);
		});
	},

	notify() {
		var View = atom.views.getView(atom.workspace);
		var cmTag = View.querySelectorAll('body /deep/ .syntax--tag:not(.syntax--meta)');
		var cmAttr = View.querySelectorAll('body /deep/ .syntax--attribute-name');
		var cmProp = View.querySelectorAll('body /deep/ .syntax--property-name');
		Array.prototype.forEach.call(cmTag, function(elm, i, arr) {
			var html = elm.innerHTML;
			if (!elm.classList.contains("syntax--definition")) {
				if (arr[i - 1] && arr[i - 1].classList.contains("syntax--definition") && elm.classList.contains("syntax--html")) {
					arr[i - 1].setAttribute("data-tag-name", html);
				}
				elm.setAttribute("data-tag-name", html);
				if (arr[i + 1] && arr[i + 1].classList.contains("syntax--definition") && elm.classList.contains("syntax--html")) {
					arr[i + 1].setAttribute("data-tag-name", html);
				}
			}
		});
		Array.prototype.forEach.call(cmAttr, function(elm, i, arr) {
			var html = elm.innerHTML;
			elm.setAttribute("data-attr-name", html);
		});
		Array.prototype.forEach.call(cmProp, function(elm, i, arr) {
			var html = elm.innerHTML;
			elm.setAttribute("data-prop-name", html);
		});
	}
};
