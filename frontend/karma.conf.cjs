module.exports=function(config){
  if(!process.env.CHROME_BIN)process.env.CHROME_BIN=require('puppeteer').executablePath({headless:'shell'});
  const root=typeof process.getuid==='function'&&process.getuid()===0;
  config.set({
    frameworks:['jasmine','webpack'],
    files:['tests/**/*.spec.jsx'],
    preprocessors:{'tests/**/*.spec.jsx':['webpack']},
    webpack:{mode:'development',devtool:'inline-source-map',resolve:{extensions:['.js','.jsx']},module:{rules:[{test:/\.[jt]sx?$/,exclude:/node_modules/,use:{loader:'babel-loader',options:{presets:[['@babel/preset-env',{targets:{chrome:'120'}}],['@babel/preset-react',{runtime:'automatic'}]],plugins:[['istanbul',{include:['src/**/*.{js,jsx}'],exclude:['src/principal.jsx']}] ]}}}]}},
    reporters:['progress','coverage'],
    coverageReporter:{dir:'coverage',reporters:[{type:'text-summary'},{type:'html',subdir:'html'},{type:'json-summary',subdir:'.',file:'coverage-summary.json'}]},
    browsers:[root?'ChromeHeadlessContainer':'ChromeHeadless'],
    customLaunchers:{ChromeHeadlessContainer:{base:'ChromeHeadless',flags:['--no-sandbox','--disable-dev-shm-usage']}},
    client:{jasmine:{random:false}},singleRun:true,browserNoActivityTimeout:60000,
  });
};
