# The Principles of Product Development Flow

## Introduzione

Benvenuto. In questo riassunto parliamo di The Principles of Product Development Flow, scritto da Donald Reinertsen e pubblicato nel 2009. Il sottotitolo è: lo sviluppo di prodotto lean di seconda generazione. È un libro denso e tecnico, che contiene più di centosettanta principi, ma è considerato da molti esperti uno dei testi più importanti mai scritti sulla gestione dello sviluppo di prodotti, software compreso.

Reinertsen è un consulente con una formazione da ingegnere e una lunga esperienza come ufficiale della marina americana. Il suo punto di partenza è una critica: molte aziende hanno provato ad applicare allo sviluppo di prodotti i principi della produzione lean, ma lo sviluppo è un'attività molto diversa dalla produzione. In fabbrica si fa la stessa cosa molte volte, e la variabilità è un nemico da eliminare. Nello sviluppo si fa ogni volta qualcosa di nuovo, e la variabilità è inevitabile, anzi a volte è proprio ciò che crea valore.

Per questo Reinertsen propone una seconda generazione di pensiero lean, basata su concetti di economia, teoria delle code, statistica e perfino strategia militare. I principi sono raggruppati in otto temi. Vediamo i più importanti.

## Prendere decisioni economiche

Il primo tema è l'economia. Reinertsen sostiene che la maggior parte delle decisioni nello sviluppo di prodotto viene presa in base a obiettivi indiretti: rispettare la data, rispettare il budget, raggiungere un certo livello di qualità, tenere occupate le persone. Ma questi obiettivi spesso sono in conflitto tra loro, e non dicono quale scegliere quando bisogna rinunciare a qualcosa.

La proposta è tradurre tutto in un'unica unità: l'impatto economico sul ciclo di vita del prodotto. Quanto vale anticipare il lancio di un mese? Quanto costa una settimana di ritardo? Quanto vale un miglioramento delle prestazioni? Solo con questa unità comune si possono confrontare alternative diverse.

Il concetto più famoso del libro nasce qui: il costo del ritardo. Reinertsen scrive che, se si dovesse quantificare una sola cosa, dovrebbe essere il costo del ritardo. È quanto perde l'azienda per ogni unità di tempo in cui un prodotto o una funzionalità non è disponibile. Secondo l'autore, nella maggior parte delle aziende nessuno lo conosce, e per questo le decisioni sulle priorità vengono prese in base all'intuito o a chi alza di più la voce.

## Le code nascoste

Il secondo tema sono le code, e secondo Reinertsen è il più importante. Nella produzione, le scorte sono visibili: pile di pezzi sul pavimento, magazzini pieni. Nello sviluppo di prodotto, le scorte sono informazioni: requisiti in attesa di essere sviluppati, codice in attesa di revisione, progetti in attesa di approvazione. Sono invisibili, non compaiono nei bilanci, e quindi nessuno le gestisce.

Eppure queste code sono la causa principale dei ritardi. Reinertsen afferma che, nello sviluppo di prodotto, la maggior parte del tempo di un progetto viene spesa in attesa nelle code, non nel lavoro vero e proprio. Le code allungano i tempi, aumentano i rischi perché il feedback arriva tardi, aumentano la variabilità, riducono la qualità e abbassano la motivazione, perché nessuno sente l'urgenza di un lavoro che aspetterà comunque settimane prima della fase successiva.

C'è poi un legame preciso tra code e utilizzo delle risorse. Dalla teoria delle code sappiamo che, quando l'utilizzo di una risorsa si avvicina al cento per cento, le code crescono in modo esplosivo. Passare da un utilizzo del sessanta all'ottanta per cento fa più che raddoppiare la coda; passare dall'ottanta al novanta la fa più che raddoppiare ancora, e oltre il novanta la crescita diventa vertiginosa. Molte aziende cercano di tenere gli ingegneri occupati al massimo, convinte di essere efficienti. In realtà, stanno creando code enormi che rallentano tutto.

## La variabilità

Il terzo tema è la variabilità. Nella produzione la variabilità è cattiva per definizione. Nello sviluppo, sostiene Reinertsen, non è così semplice: senza variabilità non c'è innovazione. Un progetto che ha sempre esito certo probabilmente non sta creando niente di nuovo.

L'obiettivo non è eliminare la variabilità, ma gestirne le conseguenze economiche. Reinertsen usa un'idea presa dalla finanza: ciò che conta non è quanto spesso falliamo, ma il rapporto tra quanto guadagniamo quando riusciamo e quanto perdiamo quando falliamo. Un esperimento economico con alta probabilità di fallimento può essere un ottimo investimento, se il fallimento costa poco e il successo vale molto.

Il modo migliore per ridurre il costo della variabilità è ridurre la dimensione dei lotti e accelerare il feedback, come vedremo nei prossimi temi.

## La dimensione dei lotti

Il quarto tema è la dimensione dei lotti, ed è forse il più pratico. Un lotto, nello sviluppo, è la quantità di lavoro che passa da una fase all'altra in un unico blocco: tutti i requisiti di un progetto, tutto il codice di un rilascio, tutti i test alla fine.

Reinertsen elenca molti benefici dei lotti piccoli. Riducono i tempi di attraversamento, perché nessun elemento deve aspettare che tutto il lotto sia completo. Riducono la variabilità del flusso. Accelerano il feedback, così gli errori vengono scoperti quando è ancora economico correggerli. Riducono il rischio, perché ogni rilascio contiene meno cambiamenti. Riducono il lavoro in corso, aumentano l'efficienza perché i problemi sono più semplici da individuare, e aumentano la motivazione, perché le persone vedono più spesso i risultati del proprio lavoro.

Perché allora le aziende usano lotti grandi? Perché ogni lotto ha un costo di transazione: preparare un rilascio, organizzare un test, ottenere un'approvazione. Se questi costi sono alti, conviene fare pochi lotti grandi. La soluzione lean è ridurre i costi di transazione, ad esempio con l'automazione, in modo che i lotti piccoli diventino convenienti. È esattamente ciò che fanno l'integrazione continua e il rilascio continuo nel software.

## Limitare il lavoro e scegliere l'ordine giusto

Il quinto tema riguarda i limiti al lavoro in corso. Reinertsen mostra che limitare il lavoro in corso è uno dei modi più efficaci per controllare le code. Quando le code crescono, si possono bloccare nuovi ingressi, spostare risorse sui colli di bottiglia, ridurre l'ambito di alcuni progetti o abbandonare i progetti meno promettenti.

Collegato a questo è il tema della sequenza: in quale ordine lavorare? Reinertsen propone di usare il costo del ritardo. Una regola molto nota, che deriva dai suoi lavori, è dare priorità al lavoro con il più alto rapporto tra costo del ritardo e durata. In altre parole: fai prima le cose che costano molto se ritardate e richiedono poco tempo. Questa regola è stata poi adottata da diversi framework agili per la gestione delle priorità.

Reinertsen osserva anche che la regola del primo arrivato, primo servito, che sembra giusta, è economicamente sensata solo quando tutti i lavori hanno lo stesso costo del ritardo e la stessa durata, cosa che quasi mai accade.

## Cadenza, feedback e controllo decentrato

Gli ultimi temi riguardano il ritmo e il controllo. La cadenza, cioè fare certe attività a intervalli regolari, come riunioni di pianificazione o rilasci, riduce i costi di coordinamento e rende prevedibile il flusso. È il principio alla base degli sprint e delle revisioni periodiche.

Il feedback veloce è fondamentale: più velocemente scopriamo un errore o un'opportunità, meno costa reagire. Reinertsen suggerisce di progettare il sistema in modo da ricevere informazioni presto, ad esempio con prototipi, test automatici e rilasci frequenti.

Infine, il controllo decentrato. Reinertsen prende ispirazione dai Marines americani, che operano in ambienti incerti e mutevoli. I Marines non controllano ogni decisione dal centro: comunicano chiaramente l'intento della missione e lasciano che chi è sul campo decida come raggiungerlo. Nello sviluppo di prodotto, allo stesso modo, il controllo centralizzato è troppo lento. Bisogna dare alle persone il contesto economico e i limiti entro cui decidere, e poi fidarsi del loro giudizio. Un esempio pratico è fornire semplici regole economiche, come quanto vale un giorno di anticipo, perché le persone possano prendere da sole decisioni coerenti.

## Misurare ciò che conta: le code come indicatore anticipatore

Reinertsen osserva che la maggior parte delle aziende misura le cose sbagliate. Misura l'utilizzo delle persone, i costi, il rispetto delle milestone. Ma queste misure arrivano tardi e dicono poco sulla salute del flusso.

La sua proposta è misurare le code. La dimensione delle code è un indicatore anticipatore: se la coda di lavoro in attesa davanti a una fase cresce oggi, i tempi di attraversamento cresceranno domani. È molto più utile sapere che la coda di revisione è raddoppiata in una settimana che scoprire, a fine trimestre, che il progetto è in ritardo.

Uno strumento suggerito è il diagramma di flusso cumulativo, che mostra nel tempo la quantità di lavoro entrato e uscito da ogni fase. La distanza verticale tra le linee indica la quantità di lavoro in coda; la distanza orizzontale indica il tempo di attraversamento. Basta un'occhiata per vedere dove il lavoro si accumula.

Reinertsen suggerisce anche di agire sulle code prima che diventino un problema, stabilendo soglie: se una coda supera un certo livello, si interviene, ad esempio spostando persone, riducendo l'ambito o bloccando nuovo lavoro in ingresso. È un po' come il controllo del traffico su un'autostrada: si regolano gli accessi prima che si formi l'ingorgo.

Un altro concetto interessante è il valore economico dell'informazione. Ogni attività di sviluppo produce informazioni: un test, un prototipo, un esperimento. L'informazione ha valore solo se riduce l'incertezza su una decisione importante. Un test che conferma ciò che già sappiamo con certezza produce poca informazione. Un test con un esito davvero incerto, che può cambiare una decisione, ne produce molta. Per questo Reinertsen suggerisce di fare presto gli esperimenti che riducono i rischi più grandi, invece di quelli più facili.

Infine, l'autore mette in guardia da una convinzione diffusa: che sia meglio pianificare tutto in dettaglio all'inizio, per evitare sorprese. In un ambiente incerto, i piani dettagliati diventano rapidamente obsoleti. Meglio piani leggeri, cicli brevi e la capacità di cambiare rotta quando arrivano nuove informazioni.

## Una storia per capire: il rilascio trimestrale

Immagina un team che rilascia il software una volta ogni tre mesi. Ogni rilascio richiede due settimane di test e una notte di lavoro per l'installazione, con il rischio sempre alto che qualcosa vada storto. Per questo il team preferisce rilasciare raramente, accumulando tante modifiche in ogni rilascio. Ma più modifiche contiene un rilascio, più è rischioso, e più test richiede.

Con gli occhi di Reinertsen, il problema è un lotto troppo grande, mantenuto da costi di transazione troppo alti. Il team investe nell'automazione dei test e dell'installazione. I costi di ogni rilascio scendono drasticamente, e diventa conveniente rilasciare ogni settimana, poi ogni giorno. I rilasci diventano piccoli, poco rischiosi, e i difetti vengono scoperti quasi subito. Il valore arriva prima ai clienti, e il costo del ritardo si riduce.

## Come ti aiuta come Scrum Master e team leader

Questo libro ti dà il fondamento economico di molte pratiche agili. Gli sprint sono cadenza. Le storie piccole sono lotti piccoli. Le retrospettive e le revisioni sono cicli di feedback. Lo Sprint Goal e i team autonomi sono controllo decentrato.

Il concetto di costo del ritardo è prezioso per aiutare il Product Owner e gli stakeholder a decidere le priorità con criteri economici invece che politici. La relazione tra utilizzo e code ti dà un argomento solido contro la pianificazione al cento per cento della capacità. E l'idea dei costi di transazione ti aiuta a giustificare investimenti in automazione e infrastruttura.

## Come metterlo in pratica da domani

Primo: per le tre iniziative più importanti del backlog, chiedi al Product Owner quanto costerebbe un mese di ritardo per ciascuna.

Secondo: individua le code invisibili del vostro processo: lavoro in attesa di revisione, test, approvazione.

Terzo: pianifica lo sprint lasciando una parte di capacità libera.

Quarto: individua il costo di transazione più alto del vostro processo e proponi un investimento per ridurlo.

Quinto: chiarisci al team l'intento delle iniziative e i limiti entro cui può decidere da solo.

## I punti cardine

Ricapitoliamo i punti cardine di The Principles of Product Development Flow.

Primo: prendi decisioni economiche. Se quantifichi una sola cosa, quantifica il costo del ritardo.

Secondo: le code sono invisibili ma causano la maggior parte dei ritardi.

Terzo: un utilizzo vicino al cento per cento fa esplodere le code.

Quarto: la variabilità non va eliminata ma gestita economicamente.

Quinto: riduci la dimensione dei lotti riducendo i costi di transazione.

Sesto: limita il lavoro in corso e scegli l'ordine con il costo del ritardo.

Settimo: usa cadenza, feedback veloce e controllo decentrato.

Il messaggio di Reinertsen è che lo sviluppo di prodotto non è una fabbrica, ma un sistema economico che si gestisce meglio con il flusso, i lotti piccoli e le decisioni prese da chi è più vicino al lavoro.

Grazie per l'ascolto.
