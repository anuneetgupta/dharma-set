const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Helper to find or create user for social logins
const findOrCreateSocialUser = async (profile, providerIdField) => {
  let user = await User.findOne({ where: { [providerIdField]: profile.id } });
  
  if (!user) {
    // Attempt to match by email if available
    const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
    if (email) {
      user = await User.findOne({ where: { email } });
      if (user) {
        // Link social ID to existing account
        user[providerIdField] = profile.id;
        await user.save();
        return user;
      }
    }
    
    // Create new user
    user = await User.create({
      [providerIdField]: profile.id,
      name: profile.displayName || profile.username || 'Social User',
      email: email
    });
  }
  return user;
};

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateSocialUser(profile, 'googleId');
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  ));
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'emails', 'photos']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateSocialUser(profile, 'facebookId');
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  ));
}

// Instagram Strategy
if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
  passport.use(new InstagramStrategy({
      clientID: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      callbackURL: "/api/auth/instagram/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateSocialUser(profile, 'instagramId');
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  ));
}

module.exports = passport;
