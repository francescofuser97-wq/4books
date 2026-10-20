# The Mythical Man-Month

## Introduzione

Benvenuto. In questo riassunto parliamo di The Mythical Man-Month, scritto da Frederick Brooks e pubblicato per la prima volta nel 1975. Il titolo si può tradurre come il mitico mese persona. È uno dei libri più famosi della storia dell'informatica, e uno dei pochi che, a quasi cinquant'anni di distanza, viene ancora citato quasi ogni giorno nelle discussioni sui progetti software.

Brooks aveva guidato in IBM lo sviluppo del sistema operativo OS 360, uno dei progetti software più grandi e complessi dell'epoca. Il progetto ebbe successo, ma con enormi ritardi, costi molto superiori alle previsioni e moltissime difficoltà. Il libro è la riflessione di Brooks su ciò che aveva imparato: perché i grandi progetti software sono così difficili da gestire, e quali errori di pensiero portano a sbagliare.

Nel 1995 è uscita un'edizione per il ventesimo anniversario, che include un famoso saggio intitolato Nessun proiettile d'argento e alcune riflessioni di Brooks su cosa, nel frattempo, si era rivelato giusto o sbagliato.

## Il catrame

Il libro si apre con un'immagine potente: la fossa di catrame. Nella preistoria, dice Brooks, grandi animali come mammut e tigri dai denti a sciabola finivano nelle pozze di catrame. Più si dibattevano, più restavano intrappolati. Nessun singolo problema era impossibile da superare, ma l'insieme di tutti li trascinava a fondo.

La programmazione di grandi sistemi, dice Brooks, è come quella fossa. Molti team, anche capaci, ci sono rimasti intrappolati. E nessuna singola difficoltà spiega il fallimento: è l'accumularsi di molti fattori che rende i progetti lenti e problematici.

Brooks spiega anche perché programmare è così attraente: la gioia di creare, di costruire cose utili per gli altri, di risolvere enigmi complessi, di imparare continuamente, di lavorare con un materiale così flessibile come il pensiero. Ma ci sono anche aspetti faticosi: la necessità di perfezione, la dipendenza dal lavoro degli altri, il lavoro noioso di cercare errori, e il fatto che il prodotto rischia di essere obsoleto ancora prima di essere finito.

## Il mito del mese persona

Il saggio che dà il titolo al libro è il più famoso. Brooks sostiene che la causa più frequente dei ritardi nei progetti software è la mancanza di tempo nel calendario, e che questa mancanza nasce da errori di stima e di pianificazione.

Il primo errore è l'ottimismo. I programmatori tendono a pensare che tutto andrà bene, che ogni attività richiederà solo il tempo necessario a farla, senza imprevisti. Ma nei grandi progetti gli imprevisti sono la norma.

Il secondo errore, il più grave, è usare il mese persona come unità di misura del lavoro. Se un lavoro richiede dodici mesi persona, sembra logico pensare che una persona lo faccia in dodici mesi, o dodici persone in un mese. Brooks spiega che questo è vero solo per attività che possono essere divise perfettamente, senza bisogno di comunicazione tra chi le fa, come raccogliere il grano in un campo. Per i compiti che non si possono dividere, aggiungere persone non serve a nulla. Brooks usa un esempio rimasto celebre: per avere un bambino servono nove mesi, indipendentemente da quante donne vengano assegnate al compito.

Il software sta a metà strada: alcune parti si possono dividere, ma ogni divisione richiede formazione delle nuove persone e comunicazione tra tutti. E la comunicazione cresce molto più velocemente del numero di persone. Con tre persone ci sono tre canali di comunicazione; con dieci persone ce ne sono quarantacinque; con venti, centonovanta.

## La legge di Brooks

Da queste osservazioni nasce la frase più famosa del libro, nota come legge di Brooks: aggiungere persone a un progetto software in ritardo lo fa ritardare ancora di più.

Il motivo è semplice. Le nuove persone devono essere formate, e a formarle sono proprio le persone esperte del progetto, che smettono di lavorare per farlo. Il lavoro deve essere diviso di nuovo, con altri sforzi di coordinamento. E il numero di canali di comunicazione aumenta. Per settimane o mesi, l'aggiunta di persone riduce la produttività invece di aumentarla.

Brooks propone alcune alternative: rivedere il calendario in modo realistico, ridurre l'ambito del progetto, o, se si aggiungono persone, farlo molto presto, non quando il ritardo è già evidente.

Un'altra osservazione celebre riguarda come si accumulano i ritardi. Brooks si chiede: come fa un progetto ad arrivare in ritardo di un anno? E risponde: un giorno alla volta. I grandi ritardi non nascono da catastrofi, ma da tanti piccoli slittamenti quotidiani che nessuno nota o segnala. Per questo consiglia traguardi intermedi concreti e verificabili, e una cultura in cui segnalare un piccolo ritardo non venga punito.

## La squadra chirurgica

Brooks affronta anche il problema di come organizzare i team. Gli studi del tempo mostravano differenze enormi di produttività tra i programmatori migliori e quelli meno capaci. Sarebbe bello, dice Brooks, affidare tutto a pochi programmatori eccellenti. Ma i grandi sistemi richiedono troppo lavoro per un piccolo gruppo.

La sua proposta è la squadra chirurgica, ispirata alle sale operatorie. Al centro c'è un programmatore capo, che progetta e scrive le parti essenziali, come il chirurgo. Attorno a lui ci sono persone con ruoli di supporto: un vice che conosce tutto il progetto, chi gestisce gli strumenti, chi si occupa dei test, chi della documentazione e dell'amministrazione. In questo modo le decisioni importanti restano nelle mani di poche persone, mentre il lavoro viene distribuito.

Oggi questo modello specifico è meno usato, ma l'intuizione di fondo resta: team piccoli, con ruoli chiari, funzionano meglio di grandi gruppi indifferenziati.

## L'integrità concettuale

Uno dei concetti più profondi del libro è l'integrità concettuale. Brooks sostiene che è la caratteristica più importante nella progettazione di un sistema. Un sistema ha integrità concettuale quando riflette un unico insieme coerente di idee, come se fosse stato progettato da una sola mente.

Brooks usa l'esempio delle cattedrali europee. Molte sono state costruite nel corso di generazioni, e ogni architetto ha aggiunto il proprio stile, con risultati spesso incoerenti. La cattedrale di Reims, invece, è rimasta fedele al progetto originale nonostante i molti costruttori, e per questo ha una straordinaria unità.

Per ottenere integrità concettuale, Brooks propone di separare l'architettura dall'implementazione. Poche persone, gli architetti, definiscono cosa il sistema deve fare e come appare all'utente. Molte altre persone realizzano il sistema. Questo non limita la creatività di chi implementa: c'è moltissima creatività nel trovare il modo migliore di realizzare un'idea.

Brooks mette anche in guardia dall'effetto del secondo sistema. Quando un architetto progetta il suo secondo sistema, dopo il successo del primo, tende a inserirci tutte le idee che aveva dovuto scartare la prima volta. Il risultato è spesso un sistema sovraccarico e complicato.

## La torre di Babele e i documenti essenziali

Brooks dedica un capitolo alla storia della torre di Babele, che descrive come il primo grande progetto di ingegneria fallito. Gli uomini avevano tutto ciò che serviva: uno scopo chiaro, le persone, i materiali, il tempo, la tecnologia. Ciò che mancò fu la comunicazione, e con la comunicazione l'organizzazione. Quando le persone non riuscirono più a capirsi, il progetto si fermò.

Secondo Brooks, molti progetti software falliscono per lo stesso motivo. I team si dividono il lavoro, ma ognuno fa ipotesi sul lavoro degli altri senza verificarle. Le interfacce cambiano senza che tutti lo sappiano. Le decisioni prese in una parte del progetto non arrivano alle altre. Brooks suggerisce di comunicare in tutti i modi possibili: in modo informale, con riunioni regolari, e con una documentazione condivisa e aggiornata del progetto.

Brooks osserva anche che, in mezzo a tutta la carta che un progetto produce, ci sono pochi documenti davvero essenziali. Per un progetto software, sono gli obiettivi, le specifiche, il calendario, il budget, l'organizzazione e la distribuzione dello spazio e delle risorse. Questi documenti non servono tanto a informare gli altri, quanto a costringere chi li scrive a prendere decisioni chiare. Spesso è proprio mentre si cerca di scrivere qualcosa che ci si accorge di non aver deciso, o di non essere d'accordo.

Un altro tema riguarda gli strumenti. Brooks racconta che ogni programmatore tende a costruire e custodire i propri strumenti personali, e suggerisce invece di investire in strumenti condivisi, mantenuti da persone dedicate. È un'intuizione che oggi ritroviamo nei team di piattaforma e nell'automazione condivisa.

Infine, Brooks riflette sulle stime. Osserva che i programmatori stimano bene il tempo per scrivere il codice, ma dimenticano tutto il resto: progettazione, test, integrazione, documentazione, problemi imprevisti. Nella sua esperienza, la scrittura del codice era solo una parte minoritaria del tempo totale di un progetto, mentre una parte molto grande era dedicata ai test e all'integrazione dei componenti.

## Prepararsi a buttarne uno

Un altro consiglio famoso è: preparati a buttarne via uno, lo farai comunque. Brooks osserva che, nella maggior parte dei progetti, il primo sistema costruito è troppo lento, troppo grande o troppo difficile da usare. Si impara solo costruendo. La domanda non è se buttare via il primo sistema, ma se farlo in modo pianificato, considerandolo un prototipo, o se consegnarlo ai clienti e costringerli a soffrire.

Nell'edizione del ventesimo anniversario, Brooks rivede in parte questo consiglio: riconosce che lo sviluppo incrementale, in cui il sistema cresce e si raffina continuamente, è un approccio migliore che costruire un intero sistema per poi buttarlo.

## Nessun proiettile d'argento

Il saggio del 1986, incluso nell'edizione successiva, è famoso quanto il libro. Brooks sostiene che non esiste un proiettile d'argento, cioè nessuna singola tecnologia o tecnica di gestione in grado, da sola, di migliorare di dieci volte la produttività del software in un decennio.

Il motivo è la distinzione tra complessità essenziale e complessità accidentale. La complessità accidentale deriva dagli strumenti: linguaggi poco espressivi, macchine lente, ambienti scomodi. Molti progressi del passato l'hanno ridotta. La complessità essenziale deriva dal problema stesso: capire cosa il sistema deve fare, gestire tutti i casi, farlo evolvere nel tempo. Nessuno strumento la elimina.

Brooks indica comunque alcune strade promettenti: comprare software invece di costruirlo quando possibile, raffinare i requisiti con prototipi rapidi, far crescere i sistemi in modo incrementale, e soprattutto coltivare grandi progettisti.

## Una storia per capire: rinforzi in arrivo

Immagina un progetto in ritardo di due mesi, a tre mesi dalla scadenza. Il management decide di aggiungere quattro sviluppatori al team di sei. Per il primo mese, i quattro nuovi arrivati devono imparare il dominio, l'architettura, gli strumenti. Gli sviluppatori esperti passano gran parte del tempo a spiegare e a rivedere il codice dei nuovi. Le riunioni si allungano, il coordinamento si complica. Alla scadenza, il progetto è in ritardo di tre mesi, non di due.

Con le lezioni di Brooks, la scelta sarebbe stata diversa: ridurre l'ambito alla parte di maggior valore, rinegoziare la data con dati realistici, o aggiungere persone solo su parti del lavoro ben separate e facili da imparare.

## Come ti aiuta come Scrum Master e team leader

Molte pratiche agili sono, in fondo, risposte ai problemi descritti da Brooks. Team piccoli e stabili riducono i canali di comunicazione. Sprint brevi con risultati verificabili rendono visibili i piccoli ritardi prima che diventino grandi. Lo sviluppo incrementale evita di costruire un intero sistema per poi buttarlo. E la stima basata sulla velocità reale del team combatte l'ottimismo.

La legge di Brooks è uno degli argomenti più utili che puoi portare al management quando, davanti a un ritardo, la prima idea è aggiungere persone al team. E il concetto di integrità concettuale ti ricorda l'importanza di una visione architetturale chiara e condivisa, anche in un team agile.

## Come metterlo in pratica da domani

Primo: quando qualcuno propone di aggiungere persone a un progetto in ritardo, calcola insieme il costo di formazione e di coordinamento.

Secondo: rendi visibili i piccoli slittamenti quotidiani, ad esempio con un grafico di avanzamento dello sprint.

Terzo: verifica che il team abbia una visione architetturale condivisa e una persona responsabile della sua coerenza.

Quarto: se state per riscrivere un sistema, attenzione all'effetto del secondo sistema: concentratevi sull'essenziale.

Quinto: diffida di chi promette che un nuovo strumento risolverà tutti i problemi.

## I punti cardine

Ricapitoliamo i punti cardine di The Mythical Man-Month.

Primo: il mese persona è un mito. Persone e tempo non sono intercambiabili.

Secondo: la legge di Brooks: aggiungere persone a un progetto in ritardo lo fa ritardare ancora di più.

Terzo: i progetti accumulano ritardi un giorno alla volta.

Quarto: l'integrità concettuale è la qualità più importante di un sistema.

Quinto: attenzione all'effetto del secondo sistema.

Sesto: nessun proiettile d'argento: la complessità essenziale non si elimina con uno strumento.

Il messaggio di Brooks è che il software è un'attività profondamente umana, e che i suoi limiti nascono soprattutto dalla comunicazione tra le persone.

Grazie per l'ascolto.
