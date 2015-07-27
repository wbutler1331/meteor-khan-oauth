Request = Meteor.npmRequire("request");
OAuth = Meteor.npmRequire("oauth-1.0a");
Url = Meteor.npmRequire("url");
Querystring = Meteor.npmRequire("querystring");

function parseUrl(url) {
  try {
    return Url.parse(url);
  } catch (ex) {
    throw new Meteor.Error("Invalid URL: " + url);
  }
}



KhanOAuth = function(consumerToken, consumerSecret, callback, opts) {
  //validate input
  if (opts === undefined)
    opts = {};
  var providerUrl = opts["providerUrl"] || "https://www.khanacademy.org/api/auth/request_token";
  var tokenExchangeUrl = opts["tokenExchangeUrl"] || "http://www.khanacademy.org/api/auth/access_token";
  var finalRedirect = opts["finalRedirect"] || "/";
  var signatureMethod = opts["signatureMethod"] || "HMAC-SHA1";
  var nonceLength = opts["nonceLength"] || 64;
  var callbackName = opts["callbackName"] || "oauthv1callback";
  var consumer = {
    public: consumerToken,
    secret: consumerSecret
  };
  var callbackUrl = parseUrl(callback);
  var path = callbackUrl.path;

  //setup the required methods
  var methods = {};
  methods[tokenExchangeMethod] =
  Meteor.methods({
    getInitialUrl: function() {
      var oauth = OAuth({
        consumer: consumer,
        signature_method: signatureMethod,
        nonce_length: nonceLength
      });

      var requestData = {
        url: providerUrl,
        method: "GET",
        data: {
          oauth_callback: callbackUrl
        }
      };
      var a = oauth.authorize(requestData, {});
      return requestData.url + "?" + Querystring.encode(a);
    },
    getFinalOAuthToken: function(oauthToken, oauthSecret, verifier) {
      var oauth = OAuth({
       consumer: consumer,
       signature_method: signatureMethod,
       nonce_length: nonceLength
      });
      var requestData = {
        url: tokenExchangeUrl,
        method: "POST",
        data: {
          oauth_token: oauthToken,
          oauth_verifier: verifier
        }
      };
      var token = {
        public: oauthToken,
        secret: oauthSecret
      };
      var oauth = OAuth.authorize(requestData, token);
      request({
        url: requestData.url,
        method: requestData.method,
        form: oauth
      }, Meteor.bindEnvironment(function(err, res, body) {
        if (error) {
          console.log("Error while requesting final access token error: " + error);
        }
        var params = Querystring.decode(body);
        var final_token = params["oauth_token"];
        var final_secret = params["oauth_token_secret"];
        Meteor.users.update({
          _id: Meteor.userId()
        }, {
          $set: {
            "oauthToken": final_token,
            "oauthTokenSecret": final_secret,
          }
        });
      }));
    }
  });

  //setup the callback route
  Router.route(path, {
    name: callbackName,
    onAfterAction: function() {
      var token = this.params.query.oauth_token;
      var secret = this.params.query.oauth_token_secret;
      var verifier = this.params.query.oauth_verifier;
      Meteor.call(tokenExchangeMethod, token, secret, verifier, function(error, result) {
        if (error) {
          console.log("Couldn't get final access token for user: " + Meteor.userId() + "due to: " + error);
        }
        Router.go(finalRedirect);
      });
    }
  });
}
