(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2f6e3454"],{"2c96":function(t,e,o){"use strict";o.r(e);var n=function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("div",{staticClass:"environment"},[o("dimension-modal",{ref:"environmentDialog",attrs:{dimension:"environment",existing:t.objt.theEnvironments},on:{"dimension-modal-update":t.addSubEnvironment}}),t.errors.length?o("p",[o("b",[t._v("Please correct the following error(s):")]),o("ul",t._l(t.errors,function(e){return o("li",{key:e},[t._v(t._s(e))])}),0)]):t._e(),o("b-form",[o("b-container",{attrs:{fluid:""}},[o("b-card",{attrs:{"bg-variant":"light",no:"",body:""}},[o("b-row",[o("b-col",{attrs:{md:"9"}},[o("b-form-group",{attrs:{label:"Environment","label-class":"font-weight-bold text-md-left","label-col":"3","label-for":"theEnvironmentInput"}},[o("b-form-input",{attrs:{id:"theEnvironmentInput",type:"text",required:""},model:{value:t.objt.theName,callback:function(e){t.$set(t.objt,"theName",e)},expression:"objt.theName"}})],1)],1),o("b-col",{attrs:{md:"3"}},[o("b-form-group",{attrs:{label:"Short Code","label-class":"font-weight-bold text-md-left","label-col":"2","label-for":"theShortCode"}},[o("b-form-input",{attrs:{id:"theShortCodeInput",type:"text",required:""},model:{value:t.objt.theShortCode,callback:function(e){t.$set(t.objt,"theShortCode",e)},expression:"objt.theShortCode"}})],1)],1)],1),o("b-row",[o("b-col",{attrs:{md:"12"}},[o("b-form-group",{attrs:{label:"Description","label-class":"font-weight-bold text-md-left","label-for":"theDescriptionInput"}},[o("b-form-textarea",{attrs:{id:"theDescription",type:"text",rows:"4","max-rows":"8",required:""},model:{value:t.objt.theDescription,callback:function(e){t.$set(t.objt,"theDescription",e)},expression:"objt.theDescription"}})],1)],1)],1),o("b-row",[o("b-col",{attrs:{md:"6"}},[o("b-table",{attrs:{striped:"",bordered:"",small:"",hover:"",items:t.environments,fields:t.environmentTableFields},scopedSlots:t._u([{key:"HEAD_environmentactions",fn:function(e){return[o("font-awesome-icon",{style:{color:"green"},attrs:{icon:"plus"},on:{click:function(o){return o.stopPropagation(),t.addEnvironment(e)}}})]}},{key:"environmentactions",fn:function(e){return[o("font-awesome-icon",{style:{color:"red"},attrs:{icon:"minus"},on:{click:function(o){return o.stopPropagation(),t.deleteEnvironment(e.item)}}})]}}])})],1),this.objt.theEnvironments.length>1?o("b-col",{attrs:{md:"3"}},[o("b-form-group",{attrs:{label:"Strategy","label-class":"font-weight-bold text-md-left","label-cols":"3","label-for":"theCompositeStrategy"}},[o("b-form-radio-group",{model:{value:t.theCompositeStrategy,callback:function(e){t.theCompositeStrategy=e},expression:"theCompositeStrategy"}},[o("b-form-radio",{attrs:{value:"Maximise"}},[t._v("Maximise")]),o("b-form-radio",{attrs:{value:"Override"}},[t._v("Override")])],1)],1)],1):t._e(),this.objt.theEnvironments.length>1&&"Override"==this.theCompositeStrategy?o("b-col",{attrs:{md:"3"}},[o("b-form-group",{attrs:{label:"Environment","label-class":"font-weight-bold text-md-left","label-cols":"2","label-for":"theEnvironmentSelect"}},[o("b-form-select",{staticClass:"mb-3",attrs:{id:"theEnvironmentSelect",options:t.objt.theEnvironments},model:{value:t.objt.theOverridingEnvironment,callback:function(e){t.$set(t.objt,"theOverridingEnvironment",e)},expression:"objt.theOverridingEnvironment"}})],1)],1):t._e()],1)],1)],1),o("b-container",{attrs:{fluid:""}},[o("b-form-row",[o("b-col",{attrs:{md:"4","offset-md":"5"}},[o("b-button",{attrs:{type:"submit",variant:"primary"},on:{click:t.onCommit}},[t._v(t._s(t.commitLabel))]),o("b-button",{attrs:{type:"submit",variant:"secondary"},on:{click:t.onCancel}},[t._v("Cancel")])],1)],1)],1)],1)],1)},i=[],r=(o("cadf"),o("551c"),o("f751"),o("097d"),o("94cc")),s={props:{object:Object,label:String},components:{DimensionModal:function(){return o.e("chunk-41bf07d3").then(o.bind(null,"1e3b"))}},mixins:[r["a"]],computed:{environments:function(){return this.objt.theEnvironments.length>0?this.objt.theEnvironments.map(function(t){return{name:t}}):[]}},data:function(){return{errors:[],objt:this.object,commitLabel:this.label,theCompositeStrategy:"Maximise",environmentTableFields:{environmentactions:{label:""},name:{label:"Environment"}}}},watch:{object:"setObject",theCompositeStrategy:"setStrategy"},methods:{setObject:function(){this.objt=this.object,this.commitLabel=this.label,"None"!=this.objt.theDuplicateProperty&&(this.theCompositeStrategy=this.objt.theDuplicateProperty)},setStrategy:function(){"Maximise"==this.theCompositeStrategy?(this.objt.theDuplicateProperty="Maximise",this.objt.theOverridingEnvironment=""):this.objt.theDuplicateProperty="Override"},onCommit:function(t){t.preventDefault(),this.checkForm()&&this.$emit("object-commit",this.objt)},onCancel:function(t){t.preventDefault(),this.$router.push({name:"objectsview",params:{dimension:"environment"}})},addEnvironment:function(){this.$refs.environmentDialog.show()},addSubEnvironment:function(t){var e=this.objt.theEnvironments.length;this.objt.theEnvironments.push(t),1==e&&(this.objt.theDuplicateProperty="Maximise")},deleteEnvironment:function(t){this.objt.theEnvironments.splice(t,1),this.objt.theEnvironments.length<2&&(this.objt.theDuplicateProperty="None",this.objt.theOverridingEnvironment="")},checkForm:function(){return this.errors=[],0==this.objt.theName.length&&this.errors.push("Environment name is required"),0==this.objt.theShortCode.length&&this.errors.push("Short code is required"),0==this.objt.theDescription.length&&this.errors.push("Description is required"),1==this.objt.theEnvironments.length&&this.errors.push("Composite environments must contain two or more environments"),!this.errors.length}}},a=s,l=o("2877"),m=Object(l["a"])(a,n,i,!1,null,null,null);e["default"]=m.exports},"94cc":function(t,e,o){"use strict";var n=o("bc3a"),i=o.n(n),r=o("61da");e["a"]={methods:{commitObject:function(t,e,o,n){var s=this;"Update"==this.commitLabel?i.a.put(t,{session_id:this.$store.state.session,object:this.objt}).then(function(t){r["a"].$emit("operation-success",t.data.message),void 0!=n?s.$router.push({name:o,params:{dimension:n}}):s.$router.push({name:o})}).catch(function(t){r["a"].$emit("operation-failure",t)}):i.a.post(e,{session_id:this.$store.state.session,object:this.objt}).then(function(t){r["a"].$emit("operation-success",t.data.message),void 0!=n?s.$router.push({name:o,params:{dimension:n}}):s.$router.push({name:o})}).catch(function(t){r["a"].$emit("operation-failure",t)})}}}}}]);
//# sourceMappingURL=chunk-2f6e3454.cd5415a1.js.map