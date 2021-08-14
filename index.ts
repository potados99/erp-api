import DormAgent from './src/core/DormAgent';

const agent = new DormAgent('g', 'g');

agent.getResidentInfo().then(console.log);
