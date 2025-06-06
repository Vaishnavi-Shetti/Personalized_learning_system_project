// // src/Components/YouTubePlayer.jsx
// import React, { useEffect, useRef } from "react";

// function YouTubePlayer({ videoId, onVideoEnd }) {
//   const playerRef = useRef(null);

//   useEffect(() => {
//     if (!window.YT) {
//       const tag = document.createElement("script");
//       tag.src = "https://www.youtube.com/iframe_api";
//       document.body.appendChild(tag);
//     }

//     const onYouTubeIframeAPIReady = () => {
//       playerRef.current = new window.YT.Player(`player-${videoId}`, {
//         videoId: videoId,
//         events: {
//           onStateChange: (event) => {
//             if (event.data === window.YT.PlayerState.ENDED) {
//               onVideoEnd();
//             }
//           },
//         },
//       });
//     };

//     if (window.YT && window.YT.Player) {
//       onYouTubeIframeAPIReady();
//     } else {
//       window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
//     }

//     return () => {
//       if (playerRef.current) {
//         playerRef.current.destroy();
//       }
//     };
//   }, [videoId, onVideoEnd]);

//   return <div id={`player-${videoId}`} style={{ width: "100%", height: "220px" }}></div>;
// }

// export default YouTubePlayer;
