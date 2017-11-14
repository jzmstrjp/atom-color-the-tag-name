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
			editor.onDidChangeCursorPosition(this.notify);
			atom.views.getView(editor).onDidChangeScrollTop(this.notify);
		});
	},

	notify() {
		var View = atom.views.getView(atom.workspace);
		var dataTagName = View.querySelectorAll('[data-tag-name]');
		var cmTag = View.querySelectorAll('.syntax--tag.syntax--entity, .syntax--attribute-name, .syntax--property-name');
		Array.prototype.forEach.call(dataTagName, function(elm, i, arr) {
			elm.removeAttribute("data-tag-name");
		});
		Array.prototype.forEach.call(cmTag, function(elm, i, arr) {
			var html = elm.textContent;
			if(/^(\.|#)/.test(html)){
				console.log(html);
				html = html.slice(1);
			}
			if(elm.classList.contains("syntax--html")){
				elm.parentNode.setAttribute("data-tag-name", html);
			}else{
				elm.setAttribute("data-tag-name", html);
			}
			
			
		});
		
	}
};
