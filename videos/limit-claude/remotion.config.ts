import {Config} from '@remotion/cli/config';
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setChromiumOpenGlRenderer('swangle');
Config.setConcurrency(2);
Config.setBrowserExecutable(process.cwd() + '/scripts/chrome-proxy.sh');
Config.setChromeMode('chrome-for-testing');
