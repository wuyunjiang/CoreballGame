
function playShoot(){
  const elem = document.getElementById("shoot_audio")
  elem.currentTime = 0
  elem.play()
}
function playPass(){
  const elem = document.getElementById("pass_audio")
  elem.currentTime = 0
  elem.play()
}
function playFailed(){
  const elem = document.getElementById("failed_audio")
  elem.currentTime = 0
  elem.play()
}
function playSuccess(){
  const elem = document.getElementById("success_audio")
  elem.currentTime = 0
  elem.play()
}

export default {
  playShoot,
  playPass,
  playFailed,
  playSuccess,
}