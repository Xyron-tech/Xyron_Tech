export function notify(message,type="success"){
  if(!message)return;
  window.dispatchEvent(new CustomEvent("xyron:notice",{detail:{message,type}}));
}
