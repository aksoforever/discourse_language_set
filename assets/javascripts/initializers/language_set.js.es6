import { withPluginApi } from "discourse/lib/plugin-api";
import { h } from "virtual-dom";
import { ajax } from "discourse/lib/ajax";
import {iconNode} from "discourse-common/lib/icon-library"
function initialize(api) {

  const allow_user_locale = Discourse.SiteSettings.allow_user_locale;
  const currentUser = api.getCurrentUser();
  const site = api.container.lookup("site:main");
  if(!allow_user_locale || !currentUser || site.mobileView) return;
  var username = currentUser.get("username");
  api.createWidget("lang-list", {
    tagName: 'li',
    html(attrs){
      return h("a",{className:"widget-link",lang:attrs.value},attrs.name);
    },
    click(event){
       ajax("/u/" + username + ".json", {
            type: "PUT",
            data: {
              locale: this.attrs.value,
            }
            })
            .then((result) => {
              window.location.reload()
            })
            .catch(error => {
              if (error) {
              console.log(error)
              }
            })
            .finally(() => {});
    }
  })
  api.createWidget("lang-default", {
    tagName: 'span',

    html(attrs,state){
      return h("a.icon",iconNode('globe'));
    },
    click(e){
      console.log(this.attrs)
      if(!this.attrs.langListVisible){
        this.sendWidgetAction("toggleLangList");
      }
    }
  })
  api.createWidget("language-switcher-menu", {
    tagName: 'div.language-switcher-menu',

    html(attrs, state){
      var html = []
      const langs = JSON.parse(Discourse.SiteSettings.available_locales)
      langs.map(v =>{
        var item = this.attach('lang-list',v);
        html.push(item)
      })
      return h("ul.menu-panel",html);

    },
    clickOutside(e) {
        this.sendWidgetAction("toggleLangList");
    },
  })
  api.createWidget("lang-set", {
    tagName: 'li.header-dropdown-toggle',
    buildKey: () => `lang_set`,
    defaultState() {
      let states = {
        langListVisible: false
      };
      return states;
    },

    toggleLangList(){
      console.log("toggleLangList")
      console.log("toggleLangList 前 " +this.state.langListVisible)
      this.state.langListVisible = !this.state.langListVisible;
      console.log("toggleLangList 后 " +this.state.langListVisible)
    },
    html(attrs, state){
      console.log("html " +this.state.langListVisible)
      const panels = [this.attach('lang-default',{langListVisible:state.langListVisible})];
      if(state.langListVisible){
      panels.push(
        this.attach('language-switcher-menu',{langListVisible:state.langListVisible})
      )}
      return panels;
    },
  })
  api.decorateWidget("header-icons:before", helper => {
    return helper.attach("lang-set");
  });
}
export default {
  name: "theme",
  initialize() {
    withPluginApi("0.8.7", initialize);
  }
};
