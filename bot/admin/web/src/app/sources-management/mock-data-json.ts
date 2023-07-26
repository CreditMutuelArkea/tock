export const jsonMockData = {
  pages: [
    {
      mdate: 'Wed Nov 17 09:04:53 CET 2021',
      id: 'c_94746',
      categories: ['CMB', 'CMSO', 'BAD', 'BAD'],
      title: 'BAD',
      body: [
        {
          bloc: "<div class=\"wysiwyg\">\n <p>Le client peut visionner le gel de sa remise en consultant son compte via l'application ou sur le site.</p> \n <p>Le solde qui s'affiche correspond au solde en temps réel et ne prend donc pas en compte le montant de la remise.&nbsp;</p> \n <p>L'affichage est le même pour l'application mobile et le site.&nbsp;</p>\n</div>",
          title: "Gel des chèques dans l'appli & site"
        },
        {
          bloc: '<div class="wysiwyg">\n <p>\n  <jalios:media data-jalios-source="c_94943" data-jalios-title="badpendant"></jalios:media></p>\n</div>',
          title: 'La réservation de la remise'
        },
        {
          bloc: '<div class="wysiwyg">\n <p>\n  <jalios:media data-jalios-source="pb_95133" data-jalios-title="badapresannulation"></jalios:media></p>\n</div>',
          title: 'Après annulation automatique ou manuelle de la réservation'
        }
      ]
    },
    {
      mdate: 'Tue Nov 09 09:26:48 CET 2021',
      id: 'c_94738',
      categories: ['CMB', 'CMSO', 'Points spécifiques', 'Points spécifiques'],
      title: 'Points spécifiques',
      body: [
        {
          bloc: '<div class="wysiwyg">\n <p><span style="font-weight: 400;">En présence de plusieurs participants sur un compte, l\'éligibilité au gel des chèques est recherchée uniquement sur le rôle de titulaire. Dès lors que celui-ci est éligible, la remise de chèques est gelée.</span></p>\n</div>',
          title: 'Titulaire - Co-titulaire'
        },
        {
          bloc: '<div class="wysiwyg">\n <p>Quand le client visualise ou imprime ses dernières opérations (document "Dernières opérations") à partir d\'un GAB, le solde présenté est actualisé de la remise de chèques "gelée" mais la ligne spécifique de réservation n\'apparaît pas.</p>\n</div>',
          title: 'GAB'
        },
        {
          bloc: '<div class="wysiwyg">\n <p><span style="font-weight: 400;">Dans le cas où un des chèques de la remise revient impayé pendant la durée du “gel”, le montant du chèque est débité mais la réservation concernant la remise globale n’est pas levée.</span></p> \n <p>\n  <jalios:media data-jalios-source="c_94913" data-jalios-title="chequesimpayes"></jalios:media></p>\n</div>',
          title: 'Les chèques impayés'
        },
        {
          bloc: '<div class="wysiwyg">\n <p><span style="font-weight: 400;">En vision Conseiller, la réservation de la remise est considérée comme un mouvement jour pendant toute la durée du gel (10 jours) :</span></p> \n <p><span style="font-weight: 400;"> \n   <jalios:media data-jalios-source="c_94739" data-jalios-title="operationjour"></jalios:media></span></p>\n</div>',
          title: 'Mouvements jour'
        }
      ]
    },
    {
      mdate: 'Tue Nov 09 09:24:33 CET 2021',
      id: 'c_94710',
      categories: ['CMB', 'CMSO', 'Synthèse client et opérations de service', 'Synthèse client et opérations de service'],
      title: 'Synthèse client et opérations de service',
      body: [
        {
          bloc: '<div class="wysiwyg">\n <p>Après la remise des chèques, celle-ci et la réservation apparaissent simultanément dans l\'historique du compte.</p> \n <p>Le solde en temps réel prend en compte la remise et la réservation, ce qui neutralise l\'opération.</p> \n <p>Le solde comptable, lors de sa mise à jour en fin de journée, prend en compte uniquement le montant de la remise.</p>\n</div>',
          title: 'Impact du gel des chèques dans la synthèse client'
        },
        {
          bloc: '<div class="wysiwyg">\n <p>\n  <jalios:media data-jalios-source="c_94933" data-jalios-title="avantremise"></jalios:media></p>\n</div>',
          title: 'Avant la remise'
        },
        {
          bloc: '<div class="wysiwyg">\n <p>\n  <jalios:media data-jalios-source="c_94994" data-jalios-title="apresremise"></jalios:media></p>\n</div>',
          title: 'Pendant la période de gel'
        },
        {
          bloc: '<div class="wysiwyg">\n <p><span style="font-weight: 400;">A partir de la page “opérations de service” de la synthèse clients, sélectionner le compte sur lequel la remise a été déposée et “gelée", puis ‘historique des mouvements” :</span></p> \n <p><span style="font-weight: 400;">1.</span></p> \n <p>\n  <jalios:media data-jalios-source="c_94916" data-jalios-title="supprimerreservation"></jalios:media></p> \n <p>&nbsp;</p> \n <p>2.&nbsp;</p> \n <p>\n  <jalios:media data-jalios-source="c_94917" data-jalios-title="supprimerreservation2"></jalios:media>&nbsp;&nbsp;<span style="color: #ffcc00;"><strong>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<span style="color: #ff0000;"> &nbsp; &nbsp;</span></strong></span></p> \n <p><span style="font-weight: 400;">Le réservation n\'apparaît plus dans l\'historique et le solde en temps réel se met à jour :&nbsp;</span></p> \n <p><span style="font-weight: 400;"> \n   <jalios:media data-jalios-source="c_94939" data-jalios-title="apresannulation"></jalios:media></span></p>\n</div>',
          title: 'Comment lever manuellement le gel des chèques avant l’échéance des 10 jours ?'
        }
      ]
    },
    {
      mdate: 'Wed Nov 17 09:04:53 CET 2021',
      id: 'c_94746',
      categories: ['CMB', 'CMSO', 'BAD', 'BAD'],
      title: 'BAD',
      body: [
        {
          bloc: "<div class=\"wysiwyg\">\n <p>Le client peut visionner le gel de sa remise en consultant son compte via l'application ou sur le site.</p> \n <p>Le solde qui s'affiche correspond au solde en temps réel et ne prend donc pas en compte le montant de la remise.&nbsp;</p> \n <p>L'affichage est le même pour l'application mobile et le site.&nbsp;</p>\n</div>",
          title: "Gel des chèques dans l'appli & site"
        },
        {
          bloc: '<div class="wysiwyg">\n <p>\n  <jalios:media data-jalios-source="c_94943" data-jalios-title="badpendant"></jalios:media></p>\n</div>',
          title: 'La réservation de la remise'
        },
        {
          bloc: '<div class="wysiwyg">\n <p>\n  <jalios:media data-jalios-source="pb_95133" data-jalios-title="badapresannulation"></jalios:media></p>\n</div>',
          title: 'Après annulation automatique ou manuelle de la réservation'
        }
      ]
    },
    {
      mdate: 'Tue Nov 09 09:26:48 CET 2021',
      id: 'c_94738',
      categories: ['CMB', 'CMSO', 'Points spécifiques', 'Points spécifiques'],
      title: 'Points spécifiques',
      body: [
        {
          bloc: '<div class="wysiwyg">\n <p><span style="font-weight: 400;">En présence de plusieurs participants sur un compte, l\'éligibilité au gel des chèques est recherchée uniquement sur le rôle de titulaire. Dès lors que celui-ci est éligible, la remise de chèques est gelée.</span></p>\n</div>',
          title: 'Titulaire - Co-titulaire'
        },
        {
          bloc: '<div class="wysiwyg">\n <p>Quand le client visualise ou imprime ses dernières opérations (document "Dernières opérations") à partir d\'un GAB, le solde présenté est actualisé de la remise de chèques "gelée" mais la ligne spécifique de réservation n\'apparaît pas.</p>\n</div>',
          title: 'GAB'
        },
        {
          bloc: '<div class="wysiwyg">\n <p><span style="font-weight: 400;">Dans le cas où un des chèques de la remise revient impayé pendant la durée du “gel”, le montant du chèque est débité mais la réservation concernant la remise globale n’est pas levée.</span></p> \n <p>\n  <jalios:media data-jalios-source="c_94913" data-jalios-title="chequesimpayes"></jalios:media></p>\n</div>',
          title: 'Les chèques impayés'
        },
        {
          bloc: '<div class="wysiwyg">\n <p><span style="font-weight: 400;">En vision Conseiller, la réservation de la remise est considérée comme un mouvement jour pendant toute la durée du gel (10 jours) :</span></p> \n <p><span style="font-weight: 400;"> \n   <jalios:media data-jalios-source="c_94739" data-jalios-title="operationjour"></jalios:media></span></p>\n</div>',
          title: 'Mouvements jour'
        }
      ]
    },
    {
      mdate: 'Tue Nov 09 09:24:33 CET 2021',
      id: 'c_94710',
      categories: ['CMB', 'CMSO', 'Synthèse client et opérations de service', 'Synthèse client et opérations de service'],
      title: 'Synthèse client et opérations de service',
      body: [
        {
          bloc: '<div class="wysiwyg">\n <p>Après la remise des chèques, celle-ci et la réservation apparaissent simultanément dans l\'historique du compte.</p> \n <p>Le solde en temps réel prend en compte la remise et la réservation, ce qui neutralise l\'opération.</p> \n <p>Le solde comptable, lors de sa mise à jour en fin de journée, prend en compte uniquement le montant de la remise.</p>\n</div>',
          title: 'Impact du gel des chèques dans la synthèse client'
        },
        {
          bloc: '<div class="wysiwyg">\n <p>\n  <jalios:media data-jalios-source="c_94933" data-jalios-title="avantremise"></jalios:media></p>\n</div>',
          title: 'Avant la remise'
        },
        {
          bloc: '<div class="wysiwyg">\n <p>\n  <jalios:media data-jalios-source="c_94994" data-jalios-title="apresremise"></jalios:media></p>\n</div>',
          title: 'Pendant la période de gel'
        },
        {
          bloc: '<div class="wysiwyg">\n <p><span style="font-weight: 400;">A partir de la page “opérations de service” de la synthèse clients, sélectionner le compte sur lequel la remise a été déposée et “gelée", puis ‘historique des mouvements” :</span></p> \n <p><span style="font-weight: 400;">1.</span></p> \n <p>\n  <jalios:media data-jalios-source="c_94916" data-jalios-title="supprimerreservation"></jalios:media></p> \n <p>&nbsp;</p> \n <p>2.&nbsp;</p> \n <p>\n  <jalios:media data-jalios-source="c_94917" data-jalios-title="supprimerreservation2"></jalios:media>&nbsp;&nbsp;<span style="color: #ffcc00;"><strong>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<span style="color: #ff0000;"> &nbsp; &nbsp;</span></strong></span></p> \n <p><span style="font-weight: 400;">Le réservation n\'apparaît plus dans l\'historique et le solde en temps réel se met à jour :&nbsp;</span></p> \n <p><span style="font-weight: 400;"> \n   <jalios:media data-jalios-source="c_94939" data-jalios-title="apresannulation"></jalios:media></span></p>\n</div>',
          title: 'Comment lever manuellement le gel des chèques avant l’échéance des 10 jours ?'
        }
      ]
    }
  ]
};
