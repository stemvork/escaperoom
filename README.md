Based on an existing escaperoom, there will be an effort to build an open-source tool for teachers to create escaperooms with less technical knowledge.

For now, the idea is to build a backend that stores the rooms, questions, hints, settings etc. This abstraction together with an interface facilitates the goal mentioned above.

The current hosting solutions is to feed the single `tsx` file to Claude and let it host the artifact. To share the escaperoom with students, one can Publish the artifact and share a link with students. In the future, hosting the escaperoom as a static website (after compiling) or as a SaaS application are possible.
