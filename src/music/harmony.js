var tonal = require('tonal')

import Smooth1DNoise from './../utils/random.js'

var harmonyPat = [ [0, 1, 2, 2], [0, 2, 1, 2], [0, 1, 2, 1],
				   [0, 1, 0, 1], [0, 1, 2, 3], [0, 2, 1, 3],
				   [0, 3, 1, 3], [1, 0, 3, 1], [1, 3, 2, 1, 0],
				   [2, 2, 3, 4, 0] ];

var rhythms = {
	4: [ [2, 1, 1], [1, 1, 2], [1, 1, 1, 1] ],
	5: [ [2, 1, 1, 1, 1], [2, 1, 1, 1, 2], [1, 1, 2, 1, 2]]
}



export default function generateHarmony( melody, interval = 0, scale ) {
	// Adjust interval to be min 0, max 2
	interval = Math.min( Math.max( 0, interval ), 2);

	// Uses the melody to generate a harmonic sequence
	var harmonic = [];
	var counter = 0;

	// console.log( tonal.note.fromMidi( melody[i].note ) )
	var c = tonal.chord.get( 'm', tonal.note.fromMidi( melody[0].note ) );

	var n = tonal.note.midi( c[interval] );
	var t = Math.max( melody[0].time, 8 );

	// Get note at current interval
	var n = tonal.note.fromMidi( melody[0].note );
	var sn = tonal.note.fromMidi( melody[0].note + 12 );

	// Find chord with this at the top
	var s = tonal.scale.get( scale, sn );
	var c;
	for ( var j = 0; j < s.length; j++ ) {
		c = tonal.chord.get( 'm', s[j] );
		if ( c[2] == n ) { break ;}
	}

	// Add proper note
	n = tonal.note.midi( c[interval] );
	switch ( interval ) {
		case 0:
			var pat1 = harmonyPat[ Math.floor( Math.random() * harmonyPat.length ) ];
			var pat2 = harmonyPat[ Math.floor( Math.random() * harmonyPat.length ) ];

			var rep1 = Math.floor( Math.random() * 3 ) + 1;
			var rep2 = Math.floor( Math.random() * 4 ) + 1;

			var r1Set = rhythms[pat1.length];
			var r2Set = rhythms[pat2.length];

			var r1 = r1Set[ Math.floor( Math.random() * r1Set.length) ];
			var r2 = r2Set[ Math.floor( Math.random() * r2Set.length) ];

			var t = 1;
			var pNote = tonal.note.midi( n );

			// Main repeats
			for ( var k = 0; k < rep2; k++ ) {
				for ( var i = 0; i < pat1.length; i++ ) {
					for ( var j = 0; j < 1; j++ ) {
						harmonic.push( {note: tonal.note.midi( s[pat1[i]] ), time: t * r1[j]} );
					}
				}

			}
			harmonic.push( {note: tonal.note.midi( s[2] ) - 12, time: t * 2, type: -1} );

			for ( var k = 0; k < rep1; k++ ) {
				for ( var i = 0; i < pat2.length; i++ ) {
					for ( var j = 0; j < rep2; j++ ) {
						harmonic.push( {note: tonal.note.midi( s[pat2[i]] ), time: t * r2[j]} );
					}
				}

			}
			harmonic.push( {note: tonal.note.midi( s[3] ) - 12, time: t * 2, type: -1} );

			var contour = createContour( 0.8, 20, 20 );
			var prevHarm = false;
			var total = [], pat3 = [];
			for ( var x = 0; x < contour.length; x++ ) {
				
				if ( prevHarm == false ) {
					total = total.concat( harmonic );
					prevHarm = true;
				} else {
					if ( contour[x] < 6 ) {
						var p = [];
						pat3 = harmonyPat[ Math.floor( Math.random() * harmonyPat.length ) ];
						for ( var k = 0; k < rep2; k++ ) {
							for ( var i = 0; i < pat3.length; i++ ) {
								p.push( {note: tonal.note.midi( s[pat3[i]] ) - 12, time: t} );
							}
						}

						pat3 = harmonyPat[ Math.floor( Math.random() * harmonyPat.length ) ];
						for ( var i = 0; i < pat3.length; i++ ) {
							p.push( {note: tonal.note.midi( s[pat3[i]] ) - 12, time: t} );
						}
						total = total.concat( p );	
					}
					else if ( contour[x] < 10 ) {
						var p = [];
						pat3 = harmonyPat[ Math.floor( Math.random() * harmonyPat.length ) ];
						for ( var k = 0; k < rep2; k++ ) {
							for ( var i = 0; i < pat3.length; i++ ) {
								p.push( {note: tonal.note.midi( s[pat3[i]] ) + 7, time: t} );
							}
						}

						pat3 = harmonyPat[ Math.floor( Math.random() * harmonyPat.length ) ];
						for ( var i = 0; i < pat3.length; i++ ) {
							p.push( {note: tonal.note.midi( s[pat3[i]] ) + 7, time: t} );
						}
						total = total.concat( p );			
					} else if ( contour[x] < 14 ) {
						var p = [];
						pat3 = harmonyPat[ Math.floor( Math.random() * harmonyPat.length ) ];
						for ( var k = 0; k < rep2; k++ ) {
							for ( var i = 0; i < pat3.length; i++ ) {
								p.push( {note: tonal.note.midi( s[pat3[i]] ) + 12, time: t} );
							}
						}
						pat3 = harmonyPat[ Math.floor( Math.random() * harmonyPat.length ) ];
						for ( var i = 0; i < pat3.length; i++ ) {
							p.push( {note: tonal.note.midi( s[pat3[i]] ) + 12, time: t} );
						}
						if ( total.length > harmonic.length ) { total = total.concat( harmonic ); }
						total = total.concat( p );
					} else {
						var p = [];
						pat3 = harmonyPat[ Math.floor( Math.random() * harmonyPat.length ) ];
						for ( var k = 0; k < rep2 * 3; k++ ) {
							for ( var i = 0; i < pat3.length; i++ ) {
								p.push( {note: tonal.note.midi( s[pat3[i]] ), time: t / 2} );
							}
						}
						if ( total.length > harmonic.length ) { total = total.concat( harmonic ); }
						total = total.concat( p );
					}
					prevHarm = false;
				}
							
			}

			harmonic = total;
			break;
		case 1:
			harmonic = insertHook2();
			break;
		case 2:
			harmonic.push( {note: n, time: 4} );
			harmonic.push( {note: -1, time: 4} );
			break;
		default:
			break;
	}
	
	return harmonic;
}

var noteType = {
	empty: 0,
	anchor: 1,
	hook: 2,
	flair: 3,
};


function genRandomIdx(start, end, max) {
	var num = Math.floor(Math.random() * max);
	var r = new Set();
	for (var i = 0; i < num; i++) {
		r.add(Math.floor(Math.random() * (end - start)) + start);
	}
	return r;
}

function insertHook2() {

	var scale = [ "G2", "A2", "Bb2", "C3", "D3", "Eb3", "F3",
	 						  "G3", "A3", "Bb3", "C4", "D4", "Eb4", "F4",
	 						  "G4", "A4", "Bb4", "C5", "D5", "Eb5", "F5",
	 						  "G5", "A5", "Bb5", "C6", "D6", "Eb6", "F6" ];

	var variations = [
		{ notes: [0,0], rhythm: [4,4] },
		{ notes: [0,-1], rhythm: [4,4] },
		{ notes: [0,1,1], rhythm: [8/3,8/3,8/3] },
		{ notes: [0,-2,1], rhythm: [4,2,2] },
		{ notes: [0,1,-1,-1], rhythm: [2,2,2,2] },
		{ notes: [0,0], rhythm: [8,16] },
	];

	var input = [];

	var intervals = [1, 2, 4];
	var newMelody = [];
	var loop = [];
	var root = Math.floor(Math.random() * scale.length);
	var interval = 1;
	for (var i = 0; i < 7; i++) {
		interval = Math.sign(-interval) * intervals[Math.floor(Math.random() * intervals.length)];
		var idx = input.length > 0 ? input[i] : root + interval;
		root = idx;

		loop.push({
			noteidx: idx,
			note: tonal.note.midi( scale[idx] ),
			time: 16,
			type: noteType.hook,
		});
	}

	for (var i = 0; i < 10; i++) {

		// var target = Math.floor(Math.random()*10);
		var target = new Set(); //genRandomIdx(0,10,7);
		var phrase = [];
		for (var j = 0; j < loop.length; j++) {
			if (target.has(j)) {

				var root = loop[j].noteidx;
				var v = Math.random() < 0.5 && v ? v : Math.floor(Math.random() * variations.length);
				var variation = variations[v];
				for (var k = 0; k < variation.notes.length; k++) {
					idx = root + variation.notes[k];
					root = idx;
					newMelody.push({
						noteidx: idx,
						note: tonal.note.midi( scale[idx] ),
						time: variation.rhythm[k],
						type: noteType.hook,
					});
					phrase.push(idx);
				}

			} else {
				newMelody.push(loop[j]);
				phrase.push(loop[j].noteidx);
			}
		}

		// console.log(phrase)
	}

	return newMelody;
}


function createContour( seed, range, spacing ) {

	// Subsample a smoothed contour
	var contour = Smooth1DNoise( Math.round( range ) , Math.random() * seed, 200 );
	var subsampledContour = [];
	for ( var i = 0; i < contour.length; i+=spacing ) {
		subsampledContour.push(Math.floor( contour[i] ));
	}

	// Remove repeats of more than 3
	var max_length = subsampledContour.length - 2;
	for ( var i = 0; i < max_length; i++ ) {
		if ( subsampledContour[i] == subsampledContour[i+1] && subsampledContour[i+1] == subsampledContour[i+2] ) {
			subsampledContour.splice( i, 1 );
			max_length--;
			i--;
		}
	}

	return subsampledContour;
}