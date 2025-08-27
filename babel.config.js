module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      // ↓ 경로 별칭 쓰면 유지, 안 쓰면 이 블록 삭제해도 됨
      ['module-resolver', {
        root: ['./src'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias: { '@': './src' },
      }],
      // ↓ 반드시 맨 마지막!
      'react-native-reanimated/plugin',
    ],
  };
};
