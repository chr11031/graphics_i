class Cubemap_Camera
{
    constructor(near, far, pos)
    {
        this._proj = new Matrix4x4();
        this._proj.set_perspective(90.0, 90.0, near, far)

        this.set_pos(pos);

        // Private variables for 'lookat' operation
        this._trans_mat = new Matrix4x4();
        this._rot_mat   = new Matrix4x4();
        this._view      = new Matrix4x4();
    }

    set_pos(pos)
    {
        this._pos = pos;
    }    

    view_mat(side)
    {
        var X = null;
        var Y = null;
        var Z = null;

        if (side == 'px')
        {
            X = new Float32Array([ 0.0, 0.0,-1.0]);
            Y = new Float32Array([ 0.0,-1.0, 0.0]);
            Z = new Float32Array([ 1.0, 0.0, 0.0]);
        }
        else if (side == 'nx')
        {
            X = new Float32Array([ 0.0, 0.0, 1.0]);
            Y = new Float32Array([ 0.0,-1.0, 0.0]);
            Z = new Float32Array([-1.0, 0.0, 0.0]);
        }
        else if (side == 'py')
        {
            X = new Float32Array([ 1.0, 0.0, 0.0]);
            Y = new Float32Array([ 0.0, 0.0, 1.0]);
            Z = new Float32Array([ 0.0, 1.0, 0.0]);
        }
        else if (side == 'ny')
        {
            X = new Float32Array([ 1.0, 0.0, 0.0]);
            Y = new Float32Array([ 0.0, 0.0,-1.0]);
            Z = new Float32Array([ 0.0,-1.0, 0.0]);
        }
        else if (side == 'pz')
        {
            X = new Float32Array([ 1.0, 0.0, 0.0]);
            Y = new Float32Array([ 0.0,-1.0, 0.0]);
            Z = new Float32Array([ 0.0, 0.0, 1.0]);
        }
        else if (side == 'nz')
        {
            X = new Float32Array([-1.0, 0.0, 0.0]);
            Y = new Float32Array([ 0.0,-1.0, 0.0]);
            Z = new Float32Array([ 0.0, 0.0,-1.0]);
        }
        else
        {
            alert('Invalid side value ' + side + ' passed to Cubemap_Camera');
            return null;
        }


        this._trans_mat.set_translate(-this._pos[0], -this._pos[1], -this._pos[2]);


        this._rot_mat.set_identity();
        this._rot_mat.set(0, 0, X[0]);
        this._rot_mat.set(0, 1, X[1]);
        this._rot_mat.set(0, 2, X[2]);
        this._rot_mat.set(1, 0, Y[0]);
        this._rot_mat.set(1, 1, Y[1]);
        this._rot_mat.set(1, 2, Y[2]);
        this._rot_mat.set(2, 0, Z[0]);
        this._rot_mat.set(2, 1, Z[1]);
        this._rot_mat.set(2, 2, Z[2]);

        // this._rot_mat.set(0, 0, X[0]);
        // this._rot_mat.set(1, 0, X[1]);
        // this._rot_mat.set(2, 0, X[2]);
        // this._rot_mat.set(0, 1, Y[0]);
        // this._rot_mat.set(1, 1, Y[1]);
        // this._rot_mat.set(2, 1, Y[2]);
        // this._rot_mat.set(0, 2, Z[0]);
        // this._rot_mat.set(1, 2, Z[1]);
        // this._rot_mat.set(2, 2, Z[2]);
                
        this._view = this._rot_mat.mult( this._trans_mat );



        return this._view;        
    }

    proj_mat()
    {
        return this._proj;
    }

    pos()
    {
        return this._pos;
    }

}