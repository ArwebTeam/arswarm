# arswarm

Arswarm is a transaction and change caching/broadcasting layer

# What does it do?

The average block time in the arweave network is 5 minutes.

This is too slow to be usable for real-time services.

Arswarm creates a layer on top of arweave's permaweb, to synchronize transactions in real-time,
before they get mined, by utilizing an in-browser libp2p swarm.

Later as they get incoorparated into the blockchain it will simply fetch them from there.
