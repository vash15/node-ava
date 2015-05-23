#!/usr/bin/env node

var program = require('commander');
var colors = require('colors');
var path = require('path');
var pkg = require('../package.json');

program
	.version(pkg.version);

var logo = '' + 
	'     ___ _    _____ '+'\n'+
	'    /   | |  / /   |'+'\n'+
	'   / /| | | / / /| |'+'\n'+
	'  / ___ | |/ / ___ |'+'\n'+
	' /_/  |_|___/_/  |_|'+'\n';



console.log(logo.gray);


program
	.command('build [mode] [unit]')
	.description('Compila l\'applicazione')
	.action(function (mode, unit) {
		var build = require('./build');
		var scss = require('./scss');
		build(mode, unit, function (err, time, mode) {
			if (err) return handleError(err, 'JS');
			console.log('JS builded with mode '.gray + mode.cyan + '...'.gray + time.green + '\u0007');
		});
		scss(mode, function (err, time) {
			if (err) return handleError(err, 'SCSS');
			console.log('SCSS builded...'.gray + time.green + '\u0007');
		});
	});

program
	.command('start')
	.description('Esegue l\'applicazione')
	.option('-p --port <port>', 'Port')
	.action(function (options) {
		var watch = require('./watch');
		var build = require('./build');
		var scss = require('./scss');
		var express = require('./express');

		express(options, function (err, port) {
			console.log('Server started at port '.grey + (port + '').cyan);
		});

		watch(function (isJs, isCss) {
			if (isJs) {
				build('dev', null, function (err, time, mode) {
					if (err) return handleError(err, 'JS');
					console.log('JS builded...'.gray + time.green + '\u0007');
				});
			}
			if (isCss) {
				scss('dev', function (err, time) {
					if (err) return handleError(err, 'SCSS');
					console.log('SCSS builded...'.gray + time.green + '\u0007');
				});
			}
		});
	});

program
	.command('test <unit>')
	.description('Testa l\'applicazione')
	.option('-p --port <port>', 'Port', 5001)
	.action(function (unit, options) {
		var watch = require('./watch');
		var build = require('./build');
		var scss = require('./scss');
		var express = require('./express');
		options.rootPath = path.join('test', unit);

		express(options, function (err, port) {
			console.log('Test server started at port '.grey + (port + '').cyan + ' for '.grey + unit.cyan + ' unit'.grey);
		});

		watch(function (isJs, isCss) {
			if (isJs) {
				build('test', unit, function (err, time, mode) {
					if (err) return handleError(err, 'JS');
					console.log('JS builded...'.gray + time.green + '\u0007');
				});
			}
			if (isCss) {
				scss('dev', function (err, time) {
					if (err) return handleError(err, 'SCSS');
					console.log('SCSS builded...'.gray + time.green + '\u0007');
				});
			}
		});
	});


program.parse(process.argv);

if (!program.args.length) {
	program.help();
}


function handleError(err, title) {
	if (title) {
		console.error(title.red + ' error'.red);
	}
	var output = '|   '.red + err.toString().replace(/\n/g, '\n' + '|   '.red);
	console.error(output);
	console.error('');
}

