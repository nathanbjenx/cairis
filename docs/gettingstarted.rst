Quick Start
===========

Live Demo
---------

A live demo of CAIRIS is available to use on https://demo.cairis.org.  The username and password you need are *test* and *test*. Internet Explorer isn't supported by CAIRIS, but it does work well with Edge, Safari, Chrome, Firefox, and Opera.
The live demo is rebuilt every night based on the latest updates to CAIRIS, so please feel free to add, update, or remove elements in the example models, or even create new CAIRIS databases.  


Example models
--------------

The live demo comes with two example models: `NeuroGrid <http://cairis.readthedocs.io/en/latest/examples.html#neurogrid>`_ and `ACME Water <http://cairis.readthedocs.io/en/latest/examples.html#acme-water>`_.  To open these, select the System / Open Database menu, and choose the model to open. We would strongly suggest taking a look at these to quickly see how security, usability, and requirements concepts in CAIRIS fit together.

Define your contexts of use
---------------------------

How you use CAIRIS depends on how you approach the early stages of your design.  You will, however, need to create  :doc:`environments </environments>` to represent your contexts of use.  If you haven't thought about what these are yet, just create a single environment to begin with.  You can add more later.

Save early and often
----------------------

You should :doc:`save </io>` your working model early and often.  Saving a model in CAIRIS entails exporting it.  CAIRIS models are XML, so easy to edit using other tools and easy to version control. 

Supporting UX
-------------

CAIRIS supports the creation and management of :doc:`personas </roles_personas>` to represent archetypical users, and :doc:`tasks </tasks>` to describe how these interact with the system being designed.  You need to define :doc:`roles </roles_personas>` that the personas fulfil before creating personas, and personas before creating tasks.  As your design evolves `task models <http://cairis.readthedocs.io/en/latest/tasks.html#visualising-tasks>`_ and `risk analysis models <http://cairis.readthedocs.io/en/latest/risks.html#risk-analysis-model>`_ will summarise the impact that security and usability are having on each other.

Asset-driven security design
----------------------------

Once you've specified at least one environments, you can start modelling :doc:`assets </assets>` : the things that are important to you.  You should model relationships between them to help you make sense of your growing design, and identify new assets you need to protect.  As asset models gives you ideas about possible system weaknesses, record these as :doc:`vulnerabilities </vulnerabilities>`.  As you think of new threats, note who you think the :doc:`attacker </attackers>` might be, and what :doc:`threats </threat>` they might carry out.  Armed with these insights, you can then create :doc:`risks </risks>` that bring everything together.  Based on these risks, you can decide how to :doc:`respond </responses>` and add :doc:`countermeasures </countermeasures>` to mitigate them.

Threat-driven security design
-----------------------------

You don't have to start your design by thinking about assets.  CAIRIS encourages the early creation of `threat models </http://cairis.readthedocs.io/en/latest/threats_tm.html#threat-modelling>`_, which can be useful if you're still trying to make sense of what the system is and how attackers might exploit it.  This can help you better understand what your assets are, and even help you understand what the usability implications of certain threats might be.

Working with requirements
-------------------------

The earlier you start finding :doc:`requirements </gro>`, the easier it will be to spot other issues in your design.  CAIRIS lets you model requirements as goals, requirements, and use cases.

Thinking about architecture
---------------------------

Requirements aren't always easy to find, and sometimes thinking about possible architectures can help you work backwards.  You can use :doc:`architectural patterns </architecturalpatterns>` as building blocks and introduce these into environments to see risks they might be exposed to, or how they might impact personas and tasks.  You can also use :doc:`security patterns </patterns>` to see what their consequences of different pieces of *best practice* might have on your design.

Generating documentation
------------------------

Your stakeholders may not want to work directly with CAIRIS, so you can :doc:`generate documentation </gendoc>` to share your design documentation with others.

Any questions / issues
----------------------

Please raise an issue in GitHub.
