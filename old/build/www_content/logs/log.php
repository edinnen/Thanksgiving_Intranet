<?php

// Pull in the sumbitted data
$person = $_POST['person'];
$report = $_POST['report'];

// Open the XML log
$xml = new DOMDocument('1.0', 'utf-8');
$xml->formatOutput = true; // Yes, indent that shit
$xml->preserveWhiteSpace = false; // Fuck spaces
$xml->load('./log.xml'); // Load in file

$newItem = $xml->createElement('entry'); //Create a new entry tag

// Give the new entry some children
$newItem->appendChild($xml->createElement('timestamp', date("F j, Y, g:i a",time())));
$newItem->appendChild($xml->createElement('people'));
$ppl = $newItem->getElementsByTagName('people')->item(0); //Find all people in list

// Create a new tag located at //entry/people/person
foreach( $person as $key => $n ) {
  $ppl->appendChild($xml->createElement('person', $n)); // Create person tag with content in $n
}

// Add the report child
$newItem->appendChild($xml->createElement('report', $report));

// Add the new entry as a child to the entries tag
$xml->getElementsByTagName('entries')->item(0)->appendChild($newItem);

// Overwrite the old file with the updated one
$xml->save('log.xml');

// Refresh the browser to /logbook.html
header("Location: /logbook.html");

?>
