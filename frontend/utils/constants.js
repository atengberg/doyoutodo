
const isDev = true;

const getDeploymentCanisterName = () => isDev? "main_local" : "main";

export { getDeploymentCanisterName }