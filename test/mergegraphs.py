#!/usr/bin/env python3
from rdflib import Graph
# https://rdflib.readthedocs.io/en/stable/merging.html

g = Graph()

g.parse('../assets/static1_thijs.ttl', format='turtle')
g.parse('../assets/static2_thijs.ttl', format='turtle')
g.serialize('throwaway.ttl', format='turtle')
