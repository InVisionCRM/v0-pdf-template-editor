// .pnpmfile.cjs
function readPackage(pkg, context) {
  if (pkg.name === 'canvas') {
    // Allow the canvas package to run its build scripts
    pkg.requiresBuild = true;
    context.log('Enabled build script for canvas');
  }
  // You could add more else if blocks here for other packages if needed
  // e.g. for 'sharp' if you were using it and it had similar issues.
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
}; 