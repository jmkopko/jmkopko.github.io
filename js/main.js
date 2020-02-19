// https://youtu.be/akWko6L7SDw        "WpE_xMRiCLE"

// document.getElementById("quiz1").style["display"] = "none";
var video;
var player;
var done = false;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "390",
    width: "640",
    videoId: "akWko6L7SDw",
    //  wmode: transparent  makes HTML goes on top of Flash
    //  fs: disable full screen
    playerVars: {
      autoplay: 0,
      wmode: "transparent",
      fs: 0,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      showinfo: 0
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

var videoTime = 0;
var timeUpdater = null;

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  // player.setPlaybackRate(2);
  function updateTime() {
    var oldTime = videoTime;
    if (player && player.getCurrentTime) {
      videoTime = player.getCurrentTime();
    }
    if (videoTime !== oldTime) {
      onProgress(videoTime);
    }
  }
  timeUpdater = setInterval(updateTime, 100);
}

function onProgress(currentTime) {
  //   console.log(currentTime);
  if (currentTime >= 13.1 && currentTime < 13.3) {
    pauseVideo();
    loadQuiz("quiz1");
    $("#qb1").hide();
    $("#feedback_right1").hide();
    $("#feedback_wrong1").hide();
    $("#feedback_noinput1").hide();
  } else if (currentTime >= 25.2 && currentTime < 26) {
    pauseVideo();
    loadQuiz("quiz1");
    $("#qb1").hide();
    $("#feedback_right1").hide();
    $("#feedback_wrong1").hide();
    $("#feedback_noinput1").hide();
    player.seekTo(14, true);
  } else if (currentTime >= 189 && currentTime < 189.5) {
    pauseVideo();
    loadQuiz("quiz2");
    $("#qb2").hide();
    $("#feedback_wrong2").hide();
    $("#feedback_noinput2").hide();
  } else if (currentTime >= 239 && currentTime < 240) {
    pauseVideo();
    loadQuiz("quiz3");
    $("#feedback_right3").hide();
    $("#feedback_wrong3").hide();
    $("#feedback_noinput3").hide();
    $("#qb3").hide();
  }
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.

function onPlayerStateChange(event) {
  /* if (event.data == YT.PlayerState.PLAYING && !done) {
      setTimeout(stopVideo, 13000);
      done = true;
      }
   */
}

function playVideo() {
  player.playVideo();
}

function pauseVideo() {
  player.pauseVideo();
}

function stopVideo() {
  player.stopVideo();
}

function loadQuiz(quizname) {
  $("#" + quizname).show();
}

//lets try loading this shit the way it oughta work
$(document).ready(function() {
  $("#quiz1").hide();
  $("#quiz2").hide();
  $("#quiz3").hide();

  // 2. This code loads the IFrame Player API code asynchronously.
  var tag = document.createElement("script");

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // 3. This function creates an <iframe> (and YouTube player)
  //    after the API code downloads.

  document.getElementById("player").style["z-index"] = -10;
  document.getElementById("player").style["-webkit-transform"] =
    "translateZ(0)";

  $("#startbutton").click(function() {
    $("#start").hide();
    playVideo();
  });

  //   quiz 1

  $("#check1").click(function() {
    var user_input = $("input[name=q1]:checked", "#qc1").val();
    if (user_input == "yes") {
      $("#feedback_wrong1").show();
      $("#qb1").show();
      $("#check1").hide();
      $("#hint1").hide();
    } else if (user_input == "no") {
      $("#feedback_right1").show();
      $("#qb1").show();
      $("#check1").hide();
      $("#hint1").hide();
    } else {
      $("#feedback_noinput1").show();
    }
  });

  $("#hint1").click(function() {
    player.seekTo(14, true);
    playVideo();
    $("#quiz1").hide();
  });

  $("#qb1").click(function() {
    player.seekTo(27, true);
    playVideo();
    $("#quiz1").hide();
  });

  // quiz 2
  $("#check2").click(function() {
    var user_input = $("input[name=q2]:checked", "#qc2").val();
    if (user_input == "yes" || user_input == "no") {
      $("#feedback_wrong2").show();
      $("#qb2").show();
      $("#check2").hide();
    } else {
      $("#feedback_noinput2").show();
    }
  });

  $("#qb2").click(function() {
    player.seekTo(190, true);
    playVideo();
    $("#quiz2").hide();
  });

  //   quiz 3
  $("#check3").click(function() {
    var user_input = $("input[name=q3]:checked", "#qc3").val();
    if (user_input == "yes") {
      $("#feedback_right3").show();
      $("#check3").hide();
    } else if (user_input == "no") {
      $("#feedback_wrong3").show();
      $("#qb3").show();
      $("#check3").hide();
    } else {
      $("#feedback_noinput3").show();
    }
  });

  $("#qb3").click(function() {
    player.seekTo(190, true);
    playVideo();
    $("#quiz3").hide();
  });
});

// player.cueVideoById({
//     videoId:"id",
//     startSeconds:1,
//     endSeconds:7
// })

// player.loadVideoById({
//     videoId:"id",
//     startSeconds:1,
//     endSeconds:7
// })

// Get the value from a set of radio buttons
// $( "input[type=radio][name=baz]:checked" ).val();
