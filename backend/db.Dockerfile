FROM postgres:15

# Install dependencies to add a new repo
RUN apt-get update && \
    apt-get install -y wget ca-certificates gnupg && \
    rm -rf /var/lib/apt/lists/*

# Add PGDG repo and key
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    | gpg --dearmor \
    | tee /usr/share/keyrings/pgdg-archive-keyring.gpg > /dev/null

RUN echo "deb [signed-by=/usr/share/keyrings/pgdg-archive-keyring.gpg] \
    http://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list

# Install PGVector from PGDG
RUN apt-get update && \
    apt-get install -y postgresql-15-pgvector && \
    rm -rf /var/lib/apt/lists/*
