var compact = require('lodash/compact'),
    yaml    = require('yamljs'),
    config = yaml.load('./gulp/config.yml')
;

// Grouped by what can run in parallel
var assetTasks = config.assetTasks,
    codeTasks = config.codeTasks
;

module.exports = function(env) {

  function matchFilter(task) {
    if(config.tasks[task]) {
      return task;
    }
  };

  function exists(value) {
    return !!value;
  };

  return {
    assetTasks: compact(assetTasks.map(matchFilter).filter(exists)),
    codeTasks: compact(codeTasks.map(matchFilter).filter(exists))
  };
};
