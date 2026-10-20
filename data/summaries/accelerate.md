# Accelerate

## Introduzione

Benvenuto. In questo riassunto parliamo di Accelerate, scritto da Nicole Forsgren, Jez Humble e Gene Kim e pubblicato nel 2018. Il sottotitolo è: la scienza del software lean e di DevOps, costruire e scalare organizzazioni tecnologiche ad alte prestazioni.

Questo libro è diverso da quasi tutti gli altri di questa raccolta. Non nasce dall'esperienza personale di un autore, né da una storia, ma da una ricerca scientifica. Per diversi anni gli autori hanno condotto un grande studio basato su questionari, che ha raccolto le risposte di decine di migliaia di professionisti dell'informatica in aziende di ogni dimensione e settore. L'obiettivo era rispondere a una domanda semplice ma fondamentale: cosa distingue davvero le organizzazioni che consegnano software in modo eccellente da quelle che faticano? E quali pratiche causano davvero risultati migliori?

Nicole Forsgren, che ha guidato la parte scientifica, spiega nel libro come la ricerca è stata condotta e perché i risultati sono affidabili. Ma anche senza entrare nei dettagli statistici, le conclusioni sono chiare e molto utili per chi guida team software.

## Misurare le prestazioni nel modo giusto

Il primo problema che gli autori affrontano è come misurare le prestazioni di un team software. Molte misure tradizionali sono sbagliate. Le righe di codice premiano il codice prolisso. La velocità del team, misurata in punti, è una misura relativa che cambia da team a team, e se usata per confrontare i team viene facilmente manipolata. L'utilizzo delle persone, cioè quanto sono occupate, ignora il fatto che team occupati al cento per cento non hanno margine per gestire imprevisti e miglioramenti.

Gli autori propongono di misurare i risultati del sistema, non l'attività delle persone. E individuano quattro metriche chiave, che sono diventate un riferimento in tutto il settore.

La prima è il tempo di consegna delle modifiche: quanto tempo passa da quando una modifica al codice viene salvata a quando è in produzione.

La seconda è la frequenza dei rilasci: quanto spesso il team rilascia in produzione.

La terza è il tempo di ripristino del servizio: quando c'è un guasto in produzione, quanto tempo serve per ripristinare il servizio.

La quarta è la percentuale di cambiamenti che falliscono: quanti rilasci causano un problema in produzione che richiede una correzione.

Le prime due misurano la velocità. Le ultime due misurano la stabilità.

## Velocità e stabilità vanno insieme

Una delle scoperte più importanti della ricerca riguarda proprio il rapporto tra velocità e stabilità. Per decenni, nell'informatica, si è creduto che fossero in conflitto: se vuoi rilasciare più spesso, devi accettare più problemi; se vuoi sistemi stabili, devi rilasciare raramente e con molta cautela.

I dati dicono il contrario. Le organizzazioni ad alte prestazioni sono migliori in tutte e quattro le metriche contemporaneamente. Rilasciano molto più spesso, con tempi di consegna molto più brevi, e allo stesso tempo hanno meno guasti e li risolvono molto più in fretta. Le organizzazioni a basse prestazioni sono peggiori in tutto: rilasciano raramente, con tempi lunghissimi, e quando rilasciano hanno più problemi.

La spiegazione è intuitiva, se ci si pensa. Rilasci piccoli e frequenti contengono poche modifiche, sono facili da verificare e, se qualcosa va storto, facili da correggere o annullare. Rilasci grandi e rari contengono centinaia di modifiche, sono difficili da testare e, quando qualcosa si rompe, è difficile capire cosa. La velocità, se costruita sulle pratiche giuste, produce stabilità.

La ricerca mostra anche che le prestazioni nella consegna del software sono legate alle prestazioni dell'organizzazione nel suo insieme: le aziende con team software ad alte prestazioni hanno maggiori probabilità di superare i propri obiettivi di redditività, quota di mercato e produttività.

## Le capacità che fanno la differenza

Il cuore del libro presenta le capacità che, secondo la ricerca, migliorano le prestazioni. Sono circa ventiquattro, raggruppate in cinque categorie. Vediamo le più importanti.

La prima categoria è la consegna continua. Include l'uso del controllo di versione per tutto, non solo per il codice ma anche per configurazioni e infrastruttura; l'automazione dei rilasci; l'integrazione continua, cioè integrare il codice nel ramo principale molte volte al giorno; lo sviluppo su un ramo principale, evitando rami che restano separati per settimane; l'automazione dei test; la gestione dei dati di test; l'attenzione alla sicurezza fin dalle prime fasi. La ricerca mostra che queste pratiche non solo migliorano velocità e stabilità, ma riducono anche il dolore dei rilasci e il rischio di esaurimento delle persone.

La seconda categoria è l'architettura. La ricerca ha scoperto che conta meno il tipo di tecnologia usata e molto di più quanto l'architettura sia debolmente accoppiata. Un team ad alte prestazioni può fare la maggior parte delle modifiche al proprio sistema senza dover coordinarsi con altri team, può testare e rilasciare in modo indipendente, e può scegliere i propri strumenti.

La terza categoria riguarda il prodotto e il processo: lavorare in piccoli lotti, rendere visibile il flusso di lavoro dalla richiesta al cliente, raccogliere e usare il feedback dei clienti, dare ai team la possibilità di sperimentare.

La quarta categoria è la gestione lean e il monitoraggio: processi di approvazione dei cambiamenti leggeri, limiti al lavoro in corso, visualizzazione del lavoro, monitoraggio dei sistemi per prendere decisioni.

La quinta categoria è la cultura, e merita un discorso a parte.

## Le approvazioni che non proteggono

Un risultato sorprendente riguarda i processi di approvazione dei cambiamenti. In molte grandi aziende, ogni modifica in produzione deve essere approvata da un comitato esterno al team, che si riunisce periodicamente e valuta i rischi.

La ricerca ha trovato che questi comitati esterni non sono associati a una maggiore stabilità. Non riducono la percentuale di cambiamenti che falliscono. In compenso, sono associati a tempi di consegna più lunghi e a rilasci meno frequenti. In altre parole, rallentano senza proteggere davvero.

Gli autori suggeriscono alternative più efficaci: la revisione tra colleghi, ad esempio con la revisione del codice o la programmazione in coppia, combinata con una buona automazione dei test e dei rilasci. Il controllo avviene vicino al lavoro, da parte di chi lo conosce, e in modo rapido.

## Cultura generativa e leadership

Per la cultura, gli autori usano il modello del sociologo Ron Westrum, che classifica le organizzazioni in tre tipi in base a come gestiscono le informazioni.

Le organizzazioni patologiche sono orientate al potere: le informazioni vengono nascoste o usate come arma, chi porta cattive notizie viene punito, i fallimenti portano alla ricerca di un colpevole. Le organizzazioni burocratiche sono orientate alle regole: ogni reparto difende il proprio territorio, le informazioni seguono i canali ufficiali, i fallimenti portano alla ricerca di una regola da applicare. Le organizzazioni generative sono orientate alle prestazioni: le informazioni circolano liberamente, la collaborazione tra reparti è alta, chi porta cattive notizie viene ascoltato, i fallimenti portano all'indagine e all'apprendimento.

La ricerca mostra che una cultura generativa è associata a migliori prestazioni nella consegna del software e dell'organizzazione. E mostra anche che la cultura si può cambiare cambiando le pratiche: i team che adottano la consegna continua e la gestione lean tendono a sviluppare una cultura più generativa.

Il libro dedica attenzione anche alla leadership. Gli autori studiano la leadership trasformazionale, caratterizzata da cinque elementi: una visione chiara, una comunicazione che ispira, la stimolazione intellettuale delle persone, il supporto ai collaboratori e il riconoscimento personale. I team con leader che mostrano queste caratteristiche hanno maggiori probabilità di adottare le pratiche efficaci. Ma attenzione: la leadership da sola non basta, servono anche le pratiche tecniche.

## Le persone: esaurimento e soddisfazione

Un capitolo importante riguarda il benessere. La ricerca ha misurato il dolore dei rilasci, cioè quanto le persone temono di portare modifiche in produzione, e il rischio di esaurimento. Entrambi sono più bassi nei team che adottano consegna continua e gestione lean. Rilasciare spesso, in modo automatico e sicuro, rende il lavoro meno stressante.

Gli autori indicano anche alcuni fattori che riducono l'esaurimento: rispetto dei valori delle persone, un ambiente di lavoro che sostiene invece di colpevolizzare, investimenti nello sviluppo delle competenze, e la possibilità di fare un lavoro significativo. La soddisfazione lavorativa, a sua volta, è associata a migliori prestazioni.

## Una storia per capire: le quattro metriche in un team

Immagina un team che rilascia una volta al mese, dopo una settimana di test manuali e l'approvazione di un comitato. Il tempo di consegna medio delle modifiche è di sei settimane. Circa un rilascio su tre causa un problema, e ripristinare il servizio richiede spesso un giorno intero.

Il team decide di misurare le quattro metriche e di migliorarle un passo alla volta. Automatizza i test più importanti, poi l'installazione. Riduce la dimensione delle modifiche e inizia a integrare il codice ogni giorno. Concorda con il comitato di approvazione un processo semplificato per le modifiche a basso rischio, basato sulla revisione tra colleghi e sui test automatici. Dopo un anno, il team rilascia più volte a settimana, il tempo di consegna è sceso a pochi giorni, i rilasci con problemi sono diminuiti, e quando qualcosa va storto il servizio viene ripristinato in meno di un'ora. E le persone del team dicono di essere molto meno stressate il giorno del rilascio.

## Come ti aiuta come Scrum Master e team leader

Accelerate ti dà dati concreti per sostenere le pratiche che migliorano davvero il lavoro del team. Le quattro metriche sono un ottimo strumento per misurare i progressi senza cadere nelle misure di attività come la velocità o le ore lavorate. Ti permettono anche di parlare con il management in un linguaggio di risultati.

Il libro ti aiuta a dare priorità agli investimenti tecnici, come automazione dei test, integrazione continua e architettura debolmente accoppiata, spiegando che non sono un lusso ma ciò che rende possibile velocità e stabilità insieme. E il modello di Westrum ti offre una lente per osservare la cultura del team e dell'organizzazione: come reagiamo quando qualcuno porta una cattiva notizia?

## Come metterlo in pratica da domani

Primo: misura le quattro metriche del tuo team, anche in modo approssimativo, e condividile con il team.

Secondo: scegli una sola metrica da migliorare nel prossimo trimestre e individua l'ostacolo principale.

Terzo: verifica quanto tempo restano aperti i rami del codice e proponi di integrare più spesso.

Quarto: analizza il processo di approvazione dei cambiamenti e proponi un'alternativa più leggera per le modifiche a basso rischio.

Quinto: nella prossima retrospettiva, chiedi al team quanto si sente sereno il giorno del rilascio, da uno a cinque.

## I punti cardine

Ricapitoliamo i punti cardine di Accelerate.

Primo: misura i risultati del sistema, non l'attività delle persone.

Secondo: le quattro metriche: tempo di consegna, frequenza dei rilasci, tempo di ripristino, percentuale di cambiamenti falliti.

Terzo: velocità e stabilità non sono in conflitto. I migliori sono migliori in entrambe.

Quarto: consegna continua, architettura debolmente accoppiata e gestione lean migliorano le prestazioni.

Quinto: i comitati di approvazione esterni rallentano senza aumentare la stabilità.

Sesto: una cultura generativa e una leadership trasformazionale sostengono le prestazioni.

Settimo: le pratiche giuste riducono il dolore dei rilasci e il rischio di esaurimento.

Il messaggio degli autori è che le prestazioni nello sviluppo software non sono una questione di fortuna o di talento, ma di capacità che si possono misurare, imparare e migliorare.

Grazie per l'ascolto.
