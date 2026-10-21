# The Phoenix Project

## Introduzione

Benvenuto. In questo riassunto parliamo di The Phoenix Project, scritto da Gene Kim, Kevin Behr e George Spafford e pubblicato nel 2013. Il sottotitolo è: un romanzo sull'IT, DevOps e su come aiutare la tua azienda a vincere. Come La Meta di Goldratt, a cui si ispira apertamente, è un romanzo che insegna principi di gestione attraverso una storia.

Il libro è diventato un classico per chiunque lavori nell'informatica. Molti lettori raccontano di essersi riconosciuti in ogni pagina: le emergenze notturne, i progetti in ritardo, i conflitti tra sviluppo e operazioni, le riunioni infinite sui cambiamenti, la persona indispensabile che tutti cercano. Attraverso la storia, gli autori mostrano come applicare all'IT i principi del pensiero lean e della teoria dei vincoli, e introducono le idee che sono alla base del movimento DevOps.

## La storia: un'azienda in crisi

Il protagonista è Bill Palmer, un responsabile dell'IT di Parts Unlimited, un'azienda americana che produce e vende ricambi per automobili. L'azienda è in difficoltà: perde quote di mercato a favore dei concorrenti, e il consiglio di amministrazione sta valutando di dividerla e venderla.

Un giorno Bill viene convocato dall'amministratore delegato, Steve Masters, che gli comunica una promozione inaspettata: il suo capo e il capo di quel capo sono stati allontanati, e ora Bill è responsabile di tutte le operazioni IT. La sua prima missione è salvare il progetto Phoenix, una grande iniziativa che dovrebbe rinnovare i sistemi di vendita dell'azienda e recuperare terreno sui concorrenti. Il progetto è in ritardo di anni e ha già consumato milioni.

Bill si trova subito in mezzo al caos. Il sistema delle buste paga si blocca, un audit di sicurezza rischia di avere conseguenze gravi, i dirigenti chiedono continuamente interventi urgenti, e il rilascio di Phoenix viene imposto con una data impossibile. Ogni giorno è una battaglia, e Bill non riesce mai ad avere il controllo della situazione.

## Il mentore: Erik e la fabbrica

In questo caos compare Erik Reid, un candidato al consiglio di amministrazione dai modi eccentrici, che diventa il mentore di Bill. Come Jonah nella Meta, Erik non dà risposte dirette. Porta Bill in uno stabilimento produttivo dell'azienda e gli fa osservare il lavoro, chiedendogli di capire cosa abbia in comune la fabbrica con il suo reparto IT.

All'inizio Bill non capisce: il lavoro dell'IT non è come produrre pezzi meccanici. Ma piano piano scopre che i principi sono gli stessi. Il lavoro IT scorre attraverso una serie di passaggi, si accumula in code, viene interrotto, deve essere rifatto quando ci sono errori. E proprio come in una fabbrica, il caos nasce dal lavoro in corso che non si vede, dai colli di bottiglia ignorati e dalla mancanza di controllo sul flusso.

## I quattro tipi di lavoro

Una delle prime lezioni di Erik è che Bill deve capire quali tipi di lavoro gestisce il suo reparto. Bill ne scopre quattro.

Il primo sono i progetti di business, come Phoenix: le iniziative richieste dall'azienda per ottenere nuovi risultati.

Il secondo sono i progetti interni dell'IT: aggiornamenti dell'infrastruttura, migrazioni, automazioni, miglioramenti che l'IT fa per se stesso.

Il terzo sono i cambiamenti: le modifiche ai sistemi, spesso generate dai primi due tipi di lavoro, come configurazioni, aggiornamenti e rilasci.

Il quarto è il lavoro non pianificato: le emergenze, gli incidenti, le correzioni urgenti. Erik lo descrive come il più distruttivo, perché si presenta senza preavviso e ruba tempo a tutti gli altri tipi di lavoro. Più lavoro non pianificato c'è, meno tempo resta per i progetti, e più si accumulano i problemi che genereranno altre emergenze.

Bill scopre che nessuno ha una visione completa di tutto il lavoro in corso. I progetti sono troppi, le richieste arrivano da ogni direzione, e molte vengono passate direttamente alle persone, saltando qualsiasi processo. Il primo passo è rendere visibile tutto il lavoro.

## Brent, il collo di bottiglia umano

Uno dei personaggi più memorabili del libro è Brent, un tecnico brillantissimo che conosce ogni sistema dell'azienda. Ogni volta che c'è un problema serio, tutti chiamano Brent. Ogni progetto ha bisogno di Brent. Ogni cambiamento importante passa da Brent. Brent lavora giorno e notte, è sempre sotto pressione, e non riesce mai a finire niente, perché viene continuamente interrotto.

Bill, guidato da Erik, capisce che Brent è il collo di bottiglia del sistema, esattamente come le macchine della Meta. Ogni ora persa da Brent è un'ora persa per tutta l'azienda. E paradossalmente, l'abilità di Brent è diventata un problema: poiché tutto passa da lui, la conoscenza è concentrata in una sola persona.

Le soluzioni sono quelle della teoria dei vincoli. Proteggere Brent dalle interruzioni, facendo passare tutte le richieste attraverso il suo responsabile. Fare in modo che lavori solo sulle attività in cui è davvero insostituibile. Documentare e trasferire la sua conoscenza agli altri, in modo che i problemi ricorrenti possano essere risolti senza di lui. E soprattutto, non lasciare che progetti nuovi vengano avviati se richiedono il tempo di Brent quando lui è già saturo.

## Le tre vie

Nel corso della storia, Erik insegna a Bill quelle che chiama le tre vie, i principi su cui si fonda DevOps.

La prima via riguarda il flusso: ottimizzare il flusso del lavoro da sinistra a destra, cioè dallo sviluppo alle operazioni fino al cliente. Significa rendere visibile il lavoro, limitare il lavoro in corso, ridurre la dimensione dei lotti, eliminare i colli di bottiglia e non far mai passare un difetto alla fase successiva. L'obiettivo è ottimizzare il sistema nel suo insieme, non le singole parti.

La seconda via riguarda il feedback: creare un flusso costante di informazioni da destra verso sinistra, dalle operazioni allo sviluppo. Quando qualcosa va storto in produzione, chi ha sviluppato il sistema deve saperlo subito, per correggere il problema e impedire che si ripeta. Significa monitoraggio, allarmi, e una cultura in cui i problemi vengono segnalati invece che nascosti.

La terza via riguarda l'apprendimento continuo: creare una cultura che favorisce la sperimentazione, accetta il rischio e impara dagli errori. Significa dedicare tempo al miglioramento del lavoro quotidiano, ripetere le pratiche fino a padroneggiarle, e introdurre a volte guasti controllati per rendere i sistemi più robusti. Erik insiste che migliorare il lavoro quotidiano è ancora più importante che fare il lavoro quotidiano.

## I cambiamenti, la sicurezza e il linguaggio del business

Due filoni secondari del romanzo sono particolarmente istruttivi.

Il primo riguarda la gestione dei cambiamenti. All'inizio della storia, a Parts Unlimited esiste un comitato che dovrebbe approvare le modifiche ai sistemi, ma nessuno lo rispetta davvero. Le modifiche vengono fatte senza avvisare, e quando qualcosa si rompe nessuno sa cosa è cambiato. Bill prova a rendere il processo obbligatorio, e il risultato è un'enorme pila di richieste che nessuno riesce a valutare. Alla fine il team trova una soluzione più semplice: una board su cui ogni cambiamento è rappresentato da una scheda, divisa per livello di rischio. I cambiamenti a basso rischio, frequenti e ben conosciuti, vengono approvati in modo quasi automatico. L'attenzione si concentra su quelli davvero rischiosi. È una lezione importante: un controllo efficace non è quello più pesante, ma quello proporzionato al rischio.

Il secondo filone riguarda la sicurezza. John, il responsabile della sicurezza informatica, all'inizio è visto da tutti come un ostacolo: chiede controlli, blocca rilasci, produce elenchi infiniti di problemi da risolvere. Un audit esterno rischia di trovare decine di carenze. Con l'aiuto di Erik, Bill e John scoprono che molti dei rischi segnalati sono già coperti da controlli nei processi di business, ad esempio nelle verifiche contabili, e che non serve rifare tutto in tecnologia. John capisce che il suo lavoro non è aggiungere controlli, ma proteggere ciò che conta davvero per l'azienda, e diventa un alleato invece di un ostacolo.

C'è poi il rapporto con il business. Bill scopre che molti progetti in corso non contribuiscono agli obiettivi dell'azienda, e che alcuni dei rischi più grandi per l'azienda dipendono dalla tecnologia senza che nessuno se ne renda conto. Imparando a collegare il lavoro dell'IT agli obiettivi dei dirigenti, come vendite, margini e soddisfazione dei clienti, Bill guadagna la fiducia dell'amministratore delegato e la possibilità di decidere quali progetti fermare.

## La trasformazione

Applicando questi principi, Bill e il suo team trasformano gradualmente l'IT. Introducono una board per rendere visibile il lavoro. Congelano temporaneamente i nuovi progetti, per smaltire il lavoro in corso e liberare capacità. Creano un processo di gestione dei cambiamenti più semplice e più efficace. Riducono le dipendenze da Brent. Cercano di capire quali progetti contribuiscono davvero agli obiettivi dell'azienda, e quali no.

La svolta più importante arriva quando sviluppo e operazioni iniziano a lavorare insieme invece di accusarsi a vicenda. Creano ambienti identici per sviluppo, test e produzione, automatizzano i rilasci, riducono la dimensione dei cambiamenti. I rilasci, che prima erano rari e traumatici, diventano frequenti e tranquilli.

Bill impara anche a parlare il linguaggio del business. Scopre che l'IT non è un reparto di supporto, ma una parte essenziale di come l'azienda raggiunge i propri obiettivi. Collabora con la responsabile delle vendite, con il direttore finanziario, con il responsabile della sicurezza, per capire quali rischi e opportunità dell'azienda dipendono dalla tecnologia. Alla fine, Parts Unlimited si salva, e Bill viene indicato come futuro dirigente dell'azienda.

## Una storia per capire: il Brent del tuo team

Quasi ogni team IT ha il suo Brent. Pensa alla persona del tuo team, o di un team vicino, che conosce l'architettura meglio di tutti, che viene chiamata per ogni incidente, che è indispensabile per ogni stima. Probabilmente è molto stimata, e probabilmente è anche molto stanca.

Prova a fare un esercizio: nelle prossime due settimane, conta quante volte questa persona viene interrotta, e quante attività del team si bloccano in attesa del suo contributo. Poi chiediti: quali di queste richieste potrebbero essere gestite da qualcun altro, con un po' di formazione o di documentazione? Introdurre la programmazione in coppia con Brent, scrivere insieme guide per i problemi ricorrenti, ruotare la reperibilità: sono tutti modi per trasformare un collo di bottiglia in un moltiplicatore di conoscenza.

## Come ti aiuta come Scrum Master e team leader

The Phoenix Project ti dà un linguaggio condiviso per parlare di flusso nell'IT. I quattro tipi di lavoro ti aiutano a rendere visibile tutto ciò che consuma la capacità del team, in particolare il lavoro non pianificato che interrompe gli sprint. Il caso di Brent ti spinge a cercare i colli di bottiglia umani e a ridurre la concentrazione della conoscenza. Le tre vie collegano le pratiche agili del team a ciò che succede prima e dopo: rilasci, operazioni, monitoraggio.

E la storia di Bill ti ricorda un punto chiave per un team leader: il tuo lavoro non è solo far funzionare il team, ma collegarlo agli obiettivi dell'azienda e dimostrare, con dati e risultati, il valore della tecnologia.

## Come metterlo in pratica da domani

Primo: classifica il lavoro del team dell'ultimo mese nei quattro tipi, e misura quanta capacità è andata in lavoro non pianificato.

Secondo: rendi visibile sulla board anche il lavoro non pianificato e i progetti interni, non solo le storie del Product Owner.

Terzo: individua il Brent del team e pianifica azioni concrete per distribuire la sua conoscenza.

Quarto: riserva in ogni sprint una parte di capacità al miglioramento del lavoro quotidiano.

Quinto: incontra il team operativo o chi gestisce la produzione, e concordate un modo per ricevere feedback rapido sui problemi.

## I punti cardine

Ricapitoliamo i punti cardine di The Phoenix Project.

Primo: il lavoro IT è simile al lavoro in fabbrica. Valgono flusso, code e colli di bottiglia.

Secondo: esistono quattro tipi di lavoro. Il lavoro non pianificato è il più distruttivo.

Terzo: rendi visibile tutto il lavoro in corso e limitalo.

Quarto: proteggi i colli di bottiglia umani e distribuisci la conoscenza.

Quinto: le tre vie: flusso, feedback, apprendimento continuo.

Sesto: migliorare il lavoro quotidiano conta più del lavoro quotidiano stesso.

Il messaggio degli autori è che l'IT può smettere di vivere nel caos e diventare un vantaggio competitivo, se impara a gestire il flusso del lavoro come le migliori fabbriche del mondo.

Grazie per l'ascolto.
