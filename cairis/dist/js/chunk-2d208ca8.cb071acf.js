(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2d208ca8"],{a5fd:function(t,e,o){"use strict";o.r(e);var a=function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("b-modal",{ref:"externalDocumentDialog",attrs:{"ok-only":"",title:t.dialogTitle}},[void 0!=t.objt?o("b-container",[o("b-form-group",{attrs:{label:"Name","label-class":"font-weight-bold text-md-left"}},[o("b-form-input",{attrs:{type:"text",readonly:""},model:{value:t.objt.theName,callback:function(e){t.$set(t.objt,"theName",e)},expression:"objt.theName"}})],1),o("b-form-group",{attrs:{label:"Authors","label-class":"font-weight-bold text-md-left"}},[o("b-form-input",{attrs:{type:"text",readonly:""},model:{value:t.objt.theAuthors,callback:function(e){t.$set(t.objt,"theAuthors",e)},expression:"objt.theAuthors"}})],1),o("b-form-group",{attrs:{label:"Version","label-class":"font-weight-bold text-md-left"}},[o("b-form-input",{attrs:{type:"text",readonly:""},model:{value:t.objt.theVersion,callback:function(e){t.$set(t.objt,"theVersion",e)},expression:"objt.theVersion"}})],1),o("b-form-group",{attrs:{label:"Publication Date","label-class":"font-weight-bold text-md-left"}},[o("b-form-input",{attrs:{type:"text",readonly:""},model:{value:t.objt.thePublicationDate,callback:function(e){t.$set(t.objt,"thePublicationDate",e)},expression:"objt.thePublicationDate"}})],1),o("b-form-group",{attrs:{label:"Description","label-class":"font-weight-bold text-md-left"}},[o("b-form-textarea",{attrs:{type:"text",rows:4,"max-rows":6,readonly:""},model:{value:t.objt.theDescription,callback:function(e){t.$set(t.objt,"theDescription",e)},expression:"objt.theDescription"}})],1)],1):t._e()],1)},l=[],n={name:"external-document-modal",props:{external_document:Object},data:function(){return{objt:this.external_document}},watch:{external_document:"updateData"},computed:{dialogTitle:function(){return(void 0!=this.objt?this.objt.theName:"")+" External Document"}},methods:{show:function(){this.$refs.externalDocumentDialog.show()},updateData:function(){this.objt=this.external_document}}},r=n,s=o("2877"),i=Object(s["a"])(r,a,l,!1,null,null,null);e["default"]=i.exports}}]);
//# sourceMappingURL=chunk-2d208ca8.cb071acf.js.map