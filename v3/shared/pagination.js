// Builds { skip, limit, size, packet, applyDateFilter } from standard {size, packet, last_updated} query params.
// Mirrors the delta-sync pagination pattern used by v2's /all_bus_location.
//
// Soft-deletable models (bus, city) pass { softDelete: true }: soft-deleted documents are hidden,
// except on a delta sync (valid last_updated) that sends include_deleted=true, where they come back
// as tombstones (isDeleted: true) so the client can evict them from its cache.
function buildPagination(query, baseFilter = {}, { softDelete = false } = {}) {
    let { size, packet, last_updated, include_deleted } = query;

    size = parseInt(size) || 100;
    packet = parseInt(packet) || 1;
    const skip = (packet - 1) * size;

    const filter = { ...baseFilter };
    if (softDelete) filter.isDeleted = { $ne: true };

    if (last_updated) {
        const cleanDateStr = String(last_updated).trim().replace(/^"|"$/g, '');
        const checkDate = new Date(cleanDateStr);

        if (!isNaN(checkDate.getTime())) {
            if (softDelete && include_deleted === 'true') delete filter.isDeleted;
            filter.$or = [
                { updatedAt: { $gt: checkDate } },
                { createdAt: { $gt: checkDate } }
            ];
        }
    }

    return { filter, skip, limit: size, size, packet, hasLastUpdated: Boolean(last_updated) };
}

async function paginatedFind(Model, query, baseFilter = {}, populateOptions = null, options = {}) {
    const { filter, skip, limit, size, packet, hasLastUpdated } = buildPagination(query, baseFilter, options);

    let dbQuery = Model.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1, _id: 1 });

    if (populateOptions) {
        dbQuery = dbQuery.populate(populateOptions);
    }

    const [data, total] = await Promise.all([
        dbQuery.lean(),
        Model.countDocuments(filter)
    ]);

    const totalPackets = Math.ceil(total / size);

    if (data.length === 0) {
        return {
            message: hasLastUpdated ? 'Already up to date' : 'No records found',
            packet,
            totalPackets: 0,
            size,
            data: []
        };
    }

    return { packet, totalPackets, size, data };
}

module.exports = { buildPagination, paginatedFind };
