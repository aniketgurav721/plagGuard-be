const path = require("path");
const timestamp = () => new Date().toISOString();

const getCallerFilePath = () => {
  const stack = new Error().stack?.split("\n") || [];
  const loggerFile = path.normalize(__filename);

  for (const line of stack) {
    const match = line.match(/\((.*):\d+:\d+\)$/);
    if (!match) continue;

    const fullPath = match[1];
    const normalizedPath = path.normalize(fullPath);
    if (normalizedPath === loggerFile) continue;
    if (normalizedPath.includes(`${path.sep}config${path.sep}log.js`)) continue;

    const projectRoot = process.cwd();
    const relativePath = path.relative(projectRoot, fullPath);
    return relativePath.startsWith("..") ? fullPath : relativePath;
  }

  return undefined;
};

const format = (level, message, context) => {
  const callerFile = getCallerFilePath();
  const contextText = context && Object.keys(context).length
    ? `\n${JSON.stringify(context, null, 2).replace(/^\s*\"([^\"]+)\":/gm, (match, key) => match.replace(`\"${key}\":`, `${key}:`))}`
    : "";
  const filePathText = callerFile ? ` [${callerFile}]` : "";
  return `[${timestamp()}] [${level}]${filePathText} ${message}${contextText}`;
};

const info = (message, context) => console.log(format("INFO", message, context));
const warn = (message, context) => console.warn(format("WARN", message, context));
const error = (message, context) => console.error(format("ERROR", message, context));
const debug = (message, context) => console.debug(format("DEBUG", message, context));

const request = (req) => {
  const details = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    query: req.query,
  };
  info("Incoming HTTP request", details);
};

module.exports = {
  info,
  warn,
  error,
  debug,
  request,
};
