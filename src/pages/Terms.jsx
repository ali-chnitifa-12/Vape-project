import { useEffect } from 'react'
import { gsap } from 'gsap'
import './Terms.css'

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0)
    gsap.fromTo('.terms-container', 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
  }, [])

  return (
    <div className="page-wrapper terms-page">
      <div className="noise-overlay" />
      <div className="grid-bg" />
      <div className="orb orb-purple" style={{ top: '10%', right: '-8%' }} />
      <div className="orb orb-cyan" style={{ bottom: '10%', left: '-5%' }} />

      <div className="container">
        <div className="terms-container">
          <h1 className="terms-title">Conditions <span className="gradient-text">Générales</span></h1>
          
          <div className="terms-content">
            <h3>PRÉAMBULE</h3>
            <p>
              Les conditions générales de vente suivantes régissent l'ensemble des transactions établies sur le catalogue web de GOOD VAPES. Toute commande passée sur ce site suppose du client son acceptation inconditionnelle et irrévocable de ces conditions.
            </p>
            <p>
              Le présent contrat est un contrat à distance qui a pour objet de définir les droits et obligations des parties dans le cadre de la vente des produits de la société GOOD VAPES sur Internet, par l'intermédiaire de la plate-forme sécurisée de paiement en ligne du Centre Monétique Interbancaire.
            </p>

            <h3>ARTICLE 1 : L'ACHETEUR</h3>
            <p>L'acheteur doit être âgé d'au moins 18 ans et avoir la capacité juridique pour effectuer une commande sur le site.</p>
            <p>L'acheteur doit s'assurer que ses données personnelles de la rubrique « mon compte » sont exactes et complètes (notamment code d'accès et/ou téléphone). Le vendeur ne peut être tenu responsable de l'impossibilité de livrer la commande si les données de l'acheteur comportent une erreur ou sont incomplètes.</p>
            <p>Le vendeur se réserve le droit d'annuler une commande si un doute subsiste sur la bonne foi de l'acheteur.</p>

            <h3>ARTICLE 2 : LES PRIX</h3>
            <p>Les prix des produits sont indiqués en dirhams marocains toutes taxes comprises hors participation aux frais de traitement et d'expédition.</p>
            <p>Les frais d'expédition sont facturés en supplément suivant le montant de la commande. Les frais d'expédition sont indiqués avant la validation de la commande par le client.</p>
            <p>Toutes les ventes sont payables en dirhams quelque que soit l'endroit où la commande est passée.</p>
            <p>Le vendeur se réserve le droit de modifier ses prix à tout moment mais les produits seront facturés selon les prix affichés lors de la commande.</p>

            <h3>ARTICLE 3 : LES PRODUITS</h3>
            <p>Les produits mis en vente par le vendeur sont présentés et détaillés de façon à ce que tout acheteur soit en mesure de connaître les caractéristiques essentielles des produits. L'acheteur prend donc connaissance des caractéristiques des produits vendus sur le site et destinés à la reproduction d'inhalation. Ces caractéristiques et ces photos sont conformes aux informations fournies par les fournisseurs du vendeur, le vendeur n'étant pas le fabricant. L'acheteur prend sous sa responsabilité le choix des produits grâce aux caractéristiques fournies par la page de présentation du produit sur le site internet, aux recommandations émises, et aux certifications. La responsabilité du vendeur ne saurait être engagée en cas d'incidents et dommages spéciaux éventuels, problèmes sanitaires ou de santé, résultant de l'utilisation des produits. L'acheteur reconnaît utiliser ce produit sur sa pleine et entière responsabilité.</p>
            <p>De même, la responsabilité du vendeur ne saurait être engagée en cas d'une consommation excessive ou en cas de non-respect de la bonne utilisation des produits conformément à l'usage pour lequel ils sont destinés (ou en cas d'utilisation avec d'autres produits), notamment conformément au manuel d'utilisation et aux caractéristiques fournies par les pages de présentation des produits sur le site internet.</p>
            <p>Il est rappelé que la cigarette électronique est toutefois interdite aux personnes mineures, déconseillée aux femmes enceintes ou allaitantes, et aux personnes atteintes de maladies cardio-vasculaires, épileptiques, asthmatiques ou sensibles à la nicotine. Il est également rappelé que la cigarette électronique n'est pas une méthode de sevrage tabagique.</p>
            <p>Les produits proposés sont conformes à la législation en vigueur et aux normes applicables. La responsabilité du vendeur ne saurait être engagée en cas de non-respect de la législation du pays où le produit est livré (par exemple en cas d'interdiction d'un produit,…). Il vous appartient de vérifier auprès des autorités locales les possibilités d'importation ou d'utilisation des produits ou services que vous envisagez de commander.</p>
            <p>Le vendeur se réserve expressément la propriété des marchandises livrées jusqu'au paiement intégral du prix de vente. Cette disposition n'annule pas la clause de responsabilité citée ci-dessous à partir du moment où la commande est transférée à l'acheteur, le vendeur n'étant pas responsable des pertes, détériorations à compter du moment où la commande aura quitté ses locaux.</p>

            <h3>ARTICLE 4 : LA COMMANDE</h3>
            <p>Lors de la première commande, l'acheteur doit créer un compte en ligne avec ses coordonnées personnelles. L'acheteur doit veiller à les maintenir actualisées. En validant sa commande, l'acheteur accepte le prix et les caractéristiques des produits présentés sur le site. En validant sa commande, l'acheteur confirme qu'il a pris connaissance des Conditions Générales de Vente et les accepte sans réserve, ni restriction. Aucune condition particulière ne peut, sauf acceptation formelle écrite de notre part, prévaloir contre nos conditions générales de vente.</p>
            <p>Après validation de la commande, l'acheteur recevra par mail la confirmation récapitulant sa commande.</p>
            <p>Les données de transactions enregistrées par le site constituent les preuves de l'ensemble des transactions commerciales passées avec l'acheteur. Les informations enregistrées au paiement constituent elles la preuve de l'ensemble des transactions financières entre le site et l'acheteur.</p>

            <h3>ARTICLE 5 : DISPONIBILITÉ</h3>
            <p>Nos offres de produits sont proposées dans la limite des stocks disponibles. La disponibilité du produit est visible sur la page de présentation du produit.</p>
            <p>Cette notification est fournie à titre indicatif. Dans l'éventualité d'une indisponibilité du produit après passation de votre commande, nous vous informerons soit par mail, soit par courrier ou téléphone. Vous aurez alors la possibilité d'annuler ou d'échanger votre commande. En cas d'indisponibilité totale, la commande sera annulée et vous serez remboursés. En cas de livraison partielle de votre commande, notre service client vous contactera afin de trouver un accord sur un éventuel échange, remboursement ou délai de réception.</p>

            <h3>ARTICLE 6 : MODES DE PAIEMENT</h3>
            <p>Toutes les commandes sont exprimées en dirhams toutes taxes comprises, avec les taux de TVA applicables au Maroc.</p>
            <p>Pour valider votre commande, vous pouvez choisir les moyens de paiement parmi ceux proposés par GOOD VAPES au niveau de la page de paiement à savoir le Paiement à la livraison ou le paiement en ligne (CMI).</p>
            <p>Avec le Paiement à la Livraison, vous pouvez régler votre commande en espèces directement lors de la réception de vos articles. Quant au paiement en ligne via la CMI (Carte Monétique Interbancaire), la remise de la transaction pour débit de votre compte est effectuée dans la journée qui suit la date de la confirmation de livraison. Vos paiements en ligne sont sécurisés par le Centre Monétique Interbancaire (CMI) qui offre un service de paiement entièrement sécurisé. Le Consommateur garantit la Société GOOD VAPES qu'il dispose des autorisations éventuellement nécessaires pour utiliser le mode de paiement choisi, lors de la validation de sa commande.</p>
            <p>En cas de paiement par carte bancaire, les dispositions relatives à l'utilisation frauduleuse du moyen de paiement prévues dans les conventions conclues entre le consommateur et l'émetteur de la carte et entre la Société GOOD VAPES et son établissement bancaire s'appliquent. Les données enregistrées par le CMI sur la plate-forme de paiement en ligne pour le compte de GOOD VAPES constituent la preuve de l'ensemble des transactions commerciales passées entre vous et la société GOOD VAPES.</p>
            <p>**Le vendeur se réserve le droit de suspendre ou d'annuler toute commande et/ou livraison, quelle que soit sa nature et niveau d'exécution, en cas de non-paiement de toute somme qui serait due par l'acheteur, en cas d'incident de paiement ou en cas de litige existant avec l'acheteur.</p>

            <h3>ARTICLE 7 : LA LIVRAISON</h3>
            <p>Les produits seront livrés à l'adresse indiquée par l'acheteur lors de l'achat sur le site, qui ne peut être que dans la zone géographique prévue (Maroc). L'acheteur doit s'assurer que ses coordonnées soient correctes et complètes (notamment numéro immeuble/ou numéro d'interphone).</p>
            <p>Faute de respect des procédures exposées ci-dessus et ci-dessous, aucune réclamation de l'acheteur ne sera acceptée.</p>
            <p>La livraison des articles s'effectue par les services : Chronodiali & Sapress.</p>
            <p>L'acheteur est livré par notre coursier ou un agent postal. En cas d'absence ou de boîte aux lettres trop petite, l'acheteur ou le destinataire du produit commandé reçoit un avis de passage de son facteur, ce qui lui permet de retirer les produits commandés au bureau de poste le plus proche, pendant un délai de quinze jours. Passé ce délai, le colis est retourné à GOOD VAPES SARLAU. Aucune contestation relative à la livraison en elle-même n'est possible si le colis apparaît comme ayant été livré, le système de Chronodiali ou Sapress faisant foi.</p>
            <p>Les marchandises voyagent aux risques et périls du destinataire, à qui il appartient de vérifier l'existence d'avarie et/ou de manquants au moment de la livraison. En présence d'une anomalie apparente du colis (notamment colis endommagé, colis ouvert, traces de liquide, etc…), l'acheteur ou le destinataire des produits commandés ne doit pas ouvrir le colis mais est invité à établir un "constat de spoliation" auprès du facteur ou dans son bureau de Poste lors de la remise du colis. L'ouverture dudit colis exclut tout recours auprès de Chronodiali ou Sapress. Toute livraison pour laquelle les réserves n'auront pas été confirmées par lettre recommandée avec AR dans les 3 jours de sa réception auprès du transporteur et dont une copie sera adressée simultanément à notre société, sera considérée comme acceptée par le client. L'acheteur se doit aussi de signaler au vendeur ces incidents dans les 48h à goodvapescasa@gmail.com en précisant le numéro de commande.</p>
            <p>Les délais de livraison dépendent notamment de la disponibilité des transporteurs et de l'ordre d'arrivée des commandes. Notre transporteur s'efforce de respecter les délais de livraison qu'il indique à l'acceptation de la commande et à exécuter les commandes, sauf en cas de force majeure, ou en cas de circonstances hors de son contrôle, telles que grèves, gel, incendie, tempête, inondation, épidémie, difficultés d'approvisionnement, sans que cette liste soit limitative. Les retards de livraison ne peuvent donner lieu à aucune pénalité ou indemnité.</p>
            <p>Les frais de livraison sont calculés automatiquement dans le récapitulatif d'achat et apparaissent dans le total à payer.</p>
            <p>Lorsque vous commandez plusieurs produits en même temps et que ceux-ci ont des délais d'expédition différents, le délai d'expédition de commande est basé sur le délai le plus long. Le vendeur se réserve toutefois la possibilité de fractionner les expéditions.</p>

            <h3>ARTICLE 8 : LES FRAIS DE PORT</h3>
            <p>Les frais de port comprennent une participation aux frais de préparations et d'emballages, ainsi que les coûts d'affranchissements. Dans l'éventualité où vous pensez acheter plusieurs articles, il est préférable de les regrouper sur une seule commande afin de ne payer qu'une seule fois des frais de port.</p>
            <p>Les frais de port restent à la charge de l'acheteur mais restent les plus bas du marché.</p>

            <h3>ARTICLE 9 : GARANTIE</h3>
            <p>Vous bénéficiez de la garantie légale des vices cachés et défauts de conformité. Seuls les produits justifiant d'un vice caché avéré pourront faire l'objet d'un retour sous ce motif. Conformément à cet article, le client qui déclare que son produit souffre d'un vice caché doit en apporter la preuve. Si l'expertise confirme l'existence d'un vice caché, le document faisant foi doit être transmis au service clients de Good-vapes.ma dans les meilleurs délais. A réception du document, une confirmation écrite ainsi que la procédure à suivre et l'adresse de retour pour envoyer votre produit vous seront communiqués par notre service clients. Les frais de retour du produit sont à la charge du client. L'acceptation de votre retour se fera après constatation du vice caché par nos services. Une fois votre retour accepté par nos services, votre produit vous sera échangé.</p>

            <h3>ARTICLE 10 : DROIT DE RÉTRACTATION</h3>
            <p>A compter de la date de livraison de votre commande, vous disposez d'un délai de 7 jours pour faire valoir votre droit de rétractation, et être intégralement remboursé. Les frais de renvoi des marchandises restant à votre charge. Cependant, seules les marchandises retournées en parfait état de revente, complètes et dans leur emballage d'origine (non-ouvert) pourront être remboursées.</p>

            <h3>ARTICLE 11 : RESPONSABILITÉ</h3>
            <p>Le vendeur ne pourra être tenue pour responsable de l'inexécution du contrat en cas de rupture de stock ou indisponibilité du produit du fait d'un cas de force majeure, de perturbation ou grève totale ou partielle notamment des services postaux et moyens de transport et/ou communications, d'inondation ou d'incendie pouvant empêcher la livraison de la commande ou la destruction de celle-ci.</p>
            <p>Tous les produits commercialisés par le vendeur sont destinés à la reproduction d'inhalation de vapeur. Aucune étude scientifique n'ayant était faite sur les effets secondaires pouvant être liés à l'absorption de certaines substances (ne pas boire l'e-liquide), l'acheteur reconnaît utiliser ces produits conformément aux conditions d'utilisation et sous sa pleine et entière responsabilité. Le vendeur ne pourra donc être tenu pour responsable d'un quelconque problème sanitaire ou de santé de l'un de ses clients, ou en cas d'incidents et dommages spéciaux éventuels résultant de l'utilisation des produits.</p>
            <p>La responsabilité du vendeur ne saurait être engagée en cas de non-respect de la bonne utilisation des produits conformément à l'usage pour lequel ils sont destinés (ou en cas d'utilisation d'autres produits), notamment conformément au manuel d'utilisation et aux caractéristiques fournies par les pages de présentation des produits sur le site internet.</p>
            <p>Les photographies et les informations contenues sur le site internet, illustrant les produits présentés ne sont pas contractuels. Bien que nous les jugeons fiables, la responsabilité du vendeur ne saurait être engagée en cas d'erreur de photographie ou de texte.</p>
            <p>En cas d'achats à titre professionnel, le vendeur n'encourra aucune responsabilité pour tous dommages indirects du fait des présentes, perte d'exploitation, perte de profit, perte de chance, dommages ou frais, qui pourraient survenir du fait de l'achat des produits.</p>
            <p>Le vendeur, dans le processus de vente en ligne, n'est tenu que par une obligation de moyens ; sa responsabilité ne pourra être engagée pour un dommage résultant de l'utilisation du réseau Internet tel que perte de données, intrusion, virus, rupture du service, ou autres problèmes involontaires.</p>

            <h3>ARTICLE 12 : PROTECTION DES DONNÉES PERSONNELLES</h3>
            <p>Le vendeur s'engage à ne pas divulguer à des tiers les informations que vous lui communiquez. Celles-ci restent confidentielles. Elles ne seront utilisées par nos services internes que pour le traitement de votre commande, et pour la communication.</p>
            <p>Le vendeur se réserve le droit d'implanter des cookies dans votre ordinateur lors des visites sur le site. Un cookie ne nous permet pas de vous identifier mais a pour objet de signaler votre précédente visite sur le site afin de nous aider à personnaliser le service qui vous est proposé.</p>

            <h3>ARTICLE 13 : DROIT APPLICABLE ET JURIDICTION COMPÉTENTE</h3>
            <p>Le présent contrat est souscrit en langue française et soumis à la loi marocaine. Tout litige pouvant naître de ces conditions générales de vente sera de la compétence du Tribunal d'instance.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
