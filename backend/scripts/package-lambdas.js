const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BACKEND_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(BACKEND_DIR, 'dist');
const OUTPUT_DIR = path.join(BACKEND_DIR, 'lambda-packages');

console.log('🚀 Starting Automated Lambda Packaging Script...');

// 1. Run build
try {
  console.log('📦 Compiling TypeScript NestJS codebase...');
  execSync('npm run build', { cwd: BACKEND_DIR, stdio: 'inherit' });
  console.log('✓ Compilation completed successfully.');
} catch (err) {
  console.error('✗ Compilation failed. Please fix TypeScript errors before packaging.');
  process.exit(1);
}

// 2. Ensure Output folder exists
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Define Lambdas
const lambdas = [
  {
    name: 'assignment-worker',
    sourceFile: path.join(DIST_DIR, 'lambda', 'assignment-worker.js'),
    dependencies: {}
  },
  {
    name: 'daily-digest',
    sourceFile: path.join(DIST_DIR, 'lambda', 'daily-digest.js'),
    dependencies: {}
  },
  {
    name: 'image-resizer',
    sourceFile: path.join(DIST_DIR, 'lambda', 'image-resize.js'),
    dependencies: {
      'jimp': '^0.22.12'
    }
  }
];

const sharedConfigSrc = path.join(DIST_DIR, 'config', 'aws.config.js');

lambdas.forEach((lambda) => {
  console.log(`\n📦 Packaging [${lambda.name}]...`);
  
  const lambdaFolder = path.join(OUTPUT_DIR, lambda.name);
  fs.mkdirSync(lambdaFolder, { recursive: true });

  // Copy handler file as index.js
  const destIndexFile = path.join(lambdaFolder, 'index.js');
  fs.copyFileSync(lambda.sourceFile, destIndexFile);

  // Copy shared AWS configuration as aws.config.js
  const destConfigFile = path.join(lambdaFolder, 'aws.config.js');
  if (fs.existsSync(sharedConfigSrc)) {
    fs.copyFileSync(sharedConfigSrc, destConfigFile);
  } else {
    console.error(`✗ Shared AWS config not found at ${sharedConfigSrc}`);
    process.exit(1);
  }

  // Rewrite import path from ../config/aws.config to ./aws.config
  let content = fs.readFileSync(destIndexFile, 'utf8');
  content = content.replace(/require\(['"]\.\.\/config\/aws\.config['"]\)/g, "require('./aws.config')");
  fs.writeFileSync(destIndexFile, content, 'utf8');
  console.log(`✓ Rewrote relative imports to local ./aws.config`);

  // Write package.json
  const packageJson = {
    name: lambda.name,
    version: '1.0.0',
    description: `AWS Lambda for ${lambda.name}`,
    main: 'index.js',
    dependencies: lambda.dependencies,
    devDependencies: {
      '@aws-sdk/client-dynamodb': '^3.0.0',
      '@aws-sdk/lib-dynamodb': '^3.0.0',
      '@aws-sdk/client-s3': '^3.0.0',
      '@aws-sdk/client-sns': '^3.0.0',
      '@aws-sdk/client-sqs': '^3.0.0',
      '@aws-sdk/client-cloudwatch': '^3.0.0'
    }
  };
  fs.writeFileSync(
    path.join(lambdaFolder, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf8'
  );

  // Install production dependencies if needed
  if (Object.keys(lambda.dependencies).length > 0) {
    console.log(` Installing dependencies inside package directory...`);
    execSync('npm install --production', { cwd: lambdaFolder, stdio: 'inherit' });
  }

  // Create ZIP archive
  const zipFile = path.join(OUTPUT_DIR, `${lambda.name}.zip`);
  console.log(` Creating zip archive ${lambda.name}.zip...`);
  try {
    // Zip contents from within the directory directly
    execSync(`zip -q -r "${zipFile}" *`, { cwd: lambdaFolder });
    console.log(`✓ [${lambda.name}] packaged successfully to ${zipFile} (${(fs.statSync(zipFile).size / 1024).toFixed(2)} KB)`);
  } catch (err) {
    console.error(`✗ Failed to create zip file for ${lambda.name}: ${err.message}`);
  }
});

console.log('\n🎉 All AWS Lambdas successfully packaged under backend/lambda-packages/!');
