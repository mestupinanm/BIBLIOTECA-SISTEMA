module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: { chrome: '44' },
      useBuiltIns: 'usage',
      corejs: 3
    }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
};
