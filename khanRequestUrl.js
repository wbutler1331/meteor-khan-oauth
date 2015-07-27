Template.khanRequestUrl.helpers({
  url: function(){
    return Session.get("khanOAuthRequestUrl");
  }
});

Template.khanRequestUrl.created = function(){
   Session.set("khanOAuthRequestUrl","");
   Meteor.call("getInitialUrl", function(error, result){
     if(error){
       console.log("error", error);
     }
     if(result){
       Session.set("khanOAuthRequestUrl", result);
     }
   });
};
