# This Is Lean

## Introduzione

Benvenuto. In questo riassunto parliamo di This Is Lean, scritto da Niklas Modig e Pär Åhlström e pubblicato nel 2012. Il sottotitolo è: risolvere il paradosso dell'efficienza. Gli autori sono due ricercatori della Stockholm School of Economics, e il libro è diventato un riferimento per chi vuole capire lean senza perdersi in strumenti e acronimi.

Modig e Åhlström partono da un'osservazione. La parola lean è usata ovunque, ma quasi tutti la intendono in modo diverso. Per qualcuno è un insieme di strumenti, come il kanban o le cinque esse. Per altri è un programma di riduzione dei costi. Per altri ancora è una filosofia di miglioramento continuo. Questa confusione fa sì che molte iniziative lean falliscano, perché copiano le pratiche senza capire il principio che le regge.

Il libro cerca di rispondere a una domanda semplice: che cos'è davvero lean? La risposta degli autori è altrettanto semplice: lean è una strategia operativa che dà priorità all'efficienza del flusso rispetto all'efficienza delle risorse. Per capire cosa significa, partono da una storia.

## Due viaggi per la stessa diagnosi

Il libro si apre con la storia di Sara, una donna che un giorno scopre un nodulo al seno. Vediamo due scenari.

Nel primo scenario, Sara chiama il suo medico di base, che può riceverla solo dopo qualche giorno. Il medico la visita e la indirizza a un esame specialistico. Sara aspetta la lettera con l'appuntamento, fa la mammografia, poi aspetta il risultato. Serve una biopsia: altro appuntamento, altra attesa. Infine incontra lo specialista per la diagnosi. In tutto passano diverse settimane. In tutto questo tempo, il lavoro effettivo dei medici su Sara è durato poche ore. Il resto è stato attesa, carico di ansia.

Nel secondo scenario, Sara si rivolge a un centro specializzato che ha organizzato il processo in modo diverso. In un solo giorno incontra il medico, fa gli esami, ottiene i risultati e riceve la diagnosi. Il lavoro dei medici è più o meno lo stesso. Ma il tempo totale è passato da settimane a poche ore.

Cosa è cambiato? Nel primo scenario, il sistema è organizzato per usare al massimo le risorse costose: medici, macchinari, laboratori. Ogni risorsa ha sempre una coda di pazienti, così non resta mai inattiva. Nel secondo scenario, il sistema è organizzato attorno al paziente: tutto si coordina perché Sara attraversi il percorso senza attese.

## Efficienza delle risorse ed efficienza del flusso

Da questa storia nascono i due concetti chiave del libro.

L'efficienza delle risorse misura quanto le risorse, persone, macchine, strutture, sono occupate rispetto al tempo disponibile. Un medico occupato tutto il giorno, una macchina che non si ferma mai, uno sviluppatore con sempre qualcosa da fare: sono esempi di alta efficienza delle risorse.

L'efficienza del flusso misura invece quanto del tempo totale di attraversamento è tempo in cui si aggiunge valore all'unità che scorre: il paziente, il prodotto, la richiesta del cliente. Se un ordine impiega dieci giorni per essere evaso e il lavoro effettivo dura un'ora, l'efficienza del flusso è bassissima.

Il punto cruciale è che le due efficienze sono spesso in conflitto. Per tenere sempre occupate le risorse, servono code di lavoro davanti a ogni risorsa. E le code allungano i tempi di attraversamento, riducendo l'efficienza del flusso. Al contrario, per far scorrere il flusso senza attese, serve un po' di capacità libera: risorse che a volte non sono occupate al cento per cento.

La maggior parte delle organizzazioni, osservano gli autori, ottimizza istintivamente l'efficienza delle risorse. Lean sceglie di dare priorità all'efficienza del flusso.

## Le tre leggi

Per spiegare perché le code si formano, gli autori presentano tre leggi della teoria dei processi.

La prima è la legge di Little, dal nome del matematico John Little. Dice che il tempo di attraversamento è uguale al numero di unità in lavorazione moltiplicato per il tempo di ciclo, cioè il tempo che passa tra l'uscita di un'unità e la successiva. In parole semplici: a parità di ritmo di produzione, più lavoro hai in corso, più tempo ci vuole perché ogni elemento arrivi alla fine. Se vuoi ridurre i tempi, riduci il lavoro in corso.

La seconda è la legge dei colli di bottiglia. Ogni processo ha un passaggio più lento degli altri, e quel passaggio determina la velocità dell'intero processo. Migliorare le altre fasi non serve, finché il collo di bottiglia resta.

La terza riguarda gli effetti della variabilità. Nella realtà, i tempi di lavorazione e gli arrivi delle richieste non sono regolari. Più c'è variabilità, più si formano code, soprattutto quando le risorse sono molto occupate. Quando l'utilizzo si avvicina al cento per cento, anche piccole variazioni creano code enormi. È per questo che un'autostrada quasi piena si blocca per un niente.

## Il paradosso dell'efficienza

Gli autori introducono a questo punto un concetto importante: i bisogni secondari. Quando un processo ha lunghi tempi di attraversamento, si creano attività che non esisterebbero in un processo fluido. Nel caso di Sara: le telefonate per chiedere a che punto è il risultato, le lettere di convocazione, gli appuntamenti da riprogrammare, l'ansia che porta a nuove visite. Nel software: i solleciti, le riunioni di aggiornamento sullo stato delle richieste, i cambi di contesto quando una storia ritorna dopo settimane con un difetto.

Questi bisogni secondari consumano risorse. E qui sta il paradosso: per essere efficienti nell'uso delle risorse, creiamo code; le code generano bisogni secondari; i bisogni secondari consumano risorse; e così le risorse sono sempre più occupate, ma con lavoro che non crea valore. Le organizzazioni si sentono sempre più impegnate, ma producono sempre meno valore.

## La matrice dell'efficienza

Combinando le due efficienze, gli autori costruiscono una matrice con quattro stati.

L'oceano dell'inefficienza: bassa efficienza delle risorse e bassa efficienza del flusso. È la situazione peggiore.

Le isole efficienti: alta efficienza delle risorse, bassa efficienza del flusso. Ogni reparto è efficiente, ma il cliente aspetta a lungo. È la situazione più comune.

La terra desolata: alta efficienza del flusso, bassa efficienza delle risorse. Il cliente è servito in fretta, ma con risorse spesso inattive e costi alti.

La stella efficiente: alta efficienza sia del flusso sia delle risorse. È l'ideale, difficile da raggiungere perché la variabilità lo impedisce.

Lean, secondo gli autori, è la strategia di muoversi verso la stella efficiente partendo dal flusso: prima si migliora l'efficienza del flusso, poi, riducendo la variabilità e i bisogni secondari, si recupera anche l'efficienza delle risorse.

## Lean è una strategia, non un insieme di strumenti

L'ultima parte del libro chiarisce cosa lean non è. Non è un insieme di strumenti: gli strumenti vanno scelti in base al contesto. Non è solo riduzione dei costi: lo scopo principale è il flusso per il cliente. Non è un progetto con una fine: è un modo di gestire.

Gli autori propongono di vedere lean su più livelli di astrazione. In alto ci sono i valori, come il rispetto per le persone e il miglioramento continuo. Poi i principi, come il just in time e la qualità costruita nel processo. Poi i metodi, come il lavoro standardizzato. Poi gli strumenti, come il kanban e le board visuali. Infine le attività quotidiane. Le organizzazioni che copiano solo gli strumenti, senza i livelli superiori, ottengono pratiche vuote. Quelle che partono dai valori e dai principi possono scegliere gli strumenti più adatti alla propria realtà.

## Una storia per capire: il team sempre occupato

Immagina un team di sei sviluppatori, tutti sempre occupati. Ognuno lavora su due o tre storie contemporaneamente, così non resta mai fermo mentre aspetta una revisione o un chiarimento. Il management è contento: nessuno è inattivo. Eppure i clienti si lamentano dei tempi, e il team è stanco.

Applicando le lenti di Modig e Åhlström, il quadro cambia. Il lavoro in corso è altissimo, quindi per la legge di Little i tempi di attraversamento sono lunghi. Le storie restano ferme in attesa di revisione perché tutti sono occupati con altro. E ogni settimana ci sono riunioni per capire a che punto sono le storie: un tipico bisogno secondario.

Il team decide un esperimento: limitare il lavoro in corso a una storia per coppia di sviluppatori, e dare priorità alle revisioni rispetto all'inizio di nuovo lavoro. Per qualche giorno alcune persone sembrano meno occupate. Ma dopo un mese le storie attraversano il processo in metà del tempo, le riunioni di aggiornamento spariscono e il team si sente meno sotto pressione.

## Come ti aiuta come Scrum Master e team leader

Questo libro ti dà le parole e i concetti per spiegare al management perché tenere tutti occupati al cento per cento non è un obiettivo sensato. La distinzione tra efficienza delle risorse ed efficienza del flusso è forse il concetto più utile per un team leader in un'azienda lean.

La legge di Little giustifica i limiti al lavoro in corso. La legge dei colli di bottiglia ti spinge a guardare dove il lavoro si accumula. Gli effetti della variabilità spiegano perché pianificare lo sprint al cento per cento della capacità porta a sprint non completati. E il concetto di bisogni secondari ti aiuta a vedere quanta parte del lavoro del team è generata dalle attese stesse.

## Come metterlo in pratica da domani

Primo: misura per qualche settimana il tempo di attraversamento delle storie, dall'inizio alla fine, e confrontalo con il tempo di lavoro effettivo.

Secondo: conta il lavoro in corso del team e prova a ridurlo.

Terzo: elenca i bisogni secondari: solleciti, riunioni di stato, rilavorazioni. Sono il segnale di un flusso lento.

Quarto: pianifica gli sprint lasciando un margine di capacità, per assorbire la variabilità.

Quinto: quando qualcuno chiede perché una persona non è occupata, spiega la differenza tra efficienza delle risorse ed efficienza del flusso.

## I punti cardine

Ricapitoliamo i punti cardine di This Is Lean.

Primo: esistono due efficienze, quella delle risorse e quella del flusso, e sono spesso in conflitto.

Secondo: lean dà priorità all'efficienza del flusso.

Terzo: la legge di Little: più lavoro in corso, tempi più lunghi.

Quarto: i colli di bottiglia determinano la velocità, e la variabilità crea code quando le risorse sono troppo occupate.

Quinto: i tempi lunghi creano bisogni secondari, che consumano risorse: è il paradosso dell'efficienza.

Sesto: lean è una strategia basata su valori e principi, non un insieme di strumenti.

Il messaggio di Modig e Åhlström è che un'organizzazione davvero efficiente non è quella in cui tutti sono sempre occupati, ma quella in cui il valore scorre senza attese verso il cliente.

Grazie per l'ascolto.
